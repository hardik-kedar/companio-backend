import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
import crypto from "crypto";
import { getRazorpayInstance } from "../utils/razorpay";
import { createNotification }
from "../services/notification.service";
import { Types } from "mongoose";

import { Notification } from "../models/Notification.model";

import Conversation from "../models/conversation.model";
import Transaction from "../models/Transaction.model";




/*
==================================================
CREATE BOOKING
Renter → Companion
==================================================
*/




export const createBooking = async (
  req: Request,
  res: Response
) => {
  try {

    const renterId =
      (req as any).user.userId;

    const {
      companionId,
      date,
      startTime,
      durationHours,
      locationText,
      message
    } = req.body;

    /*
    ============================
    VALIDATION
    ============================
    */

    if (
      !companionId ||
      !date ||
      !startTime ||
      !durationHours ||
      !locationText
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    /*
    ============================
    FIND COMPANION
    ============================
    */

    const companionUser =
      await User.findById(companionId);

    if (!companionUser)
      return res.status(404).json({
        message: "Companion not found"
      });

    if (companionUser.role !== "companion")
      return res.status(400).json({
        message: "Invalid companion"
      });

    if (!companionUser.pricePerHour)
      return res.status(400).json({
        message: "Companion pricing not set"
      });

    /*
    ============================
    PRICE CALCULATION
    ============================
    */

    const pricePerHour =
      companionUser.pricePerHour;

    const totalAmount =
      pricePerHour * Number(durationHours);

    const platformFee =
      Math.round(totalAmount * 0.15);

    const companionEarning =
      totalAmount - platformFee;

    const expiresAt =
      new Date(
        Date.now() +
        2 * 60 * 60 * 1000
      );

    /*
    ============================
    CHECK COMPANION AVAILABILITY
    ============================
    */

    const start = new Date(date);
    const [h, m] =
      startTime.split(":").map(Number);

    start.setHours(h);
    start.setMinutes(m);

    const end = new Date(
      start.getTime() +
      durationHours * 60 * 60 * 1000
    );

    const existingBookings =
      await Booking.find({
        companion: companionId,
        date: new Date(date),
        status: {
          $nin: [
            "cancelled",
            "expired",
            "payment_failed"
          ]
        }
      });

    for (const b of existingBookings) {

      const [bh, bm] =
        b.startTime.split(":").map(Number);

      const bStart =
        new Date(b.date);

      bStart.setHours(bh);
      bStart.setMinutes(bm);

      const bEnd =
        new Date(
          bStart.getTime() +
          b.durationHours *
          60 *
          60 *
          1000
        );

      const overlap =
        start < bEnd && end > bStart;

      if (overlap) {
        return res.status(400).json({
          message:
            "Companion already booked at this time"
        });
      }
    }

    /*
    ============================
    CREATE BOOKING
    ============================
    */

    const booking =
      await Booking.create({

        renter: renterId,

        companion: companionId,

        date,

        startTime,

        durationHours,

        locationText,

        message,

        pricePerHour,

        totalAmount,

        platformFee,

        companionEarning,

        status: "pending_acceptance",

        expiresAt

      });

    /*
    ============================
    NOTIFICATIONS
    ============================
    */

    await createNotification(

      renterId,

      "booking_request_sent",

      "Booking request sent",

      "Your booking request has been sent to the companion.",

      booking._id

    );

    await createNotification(

      companionId,

      "booking_request_received",

      "New booking request",

      "You received a new booking request.",

      booking._id

    );

    return res.status(201).json({

      message: "Booking request sent",

      booking

    });

  } catch (error) {

    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to create booking"
    });

  }
};
/*
==================================================
ACCEPT BOOKING (COMPANION)
==================================================
*/



export const acceptBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const companionId =
      (req as any).user.userId;

    const { bookingId } =
      req.body;

    if (!bookingId) {

      return res.status(400).json({
        message: "bookingId required"
      });

    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }

    /*
    =========================
    OWNERSHIP CHECK
    =========================
    */

    if (
      booking.companion.toString()
      !==
      companionId.toString()
    ) {

      return res.status(403).json({
        message: "Not your booking"
      });

    }

    /*
    =========================
    REQUEST EXPIRY CHECK
    =========================
    */

    if (
      booking.expiresAt &&
      booking.expiresAt.getTime()
      <
      Date.now()
    ) {

      booking.status = "expired";

      await booking.save();

      return res.status(400).json({
        message: "Request expired"
      });

    }

    /*
    =========================
    STATUS CHECK
    =========================
    */

    if (
      booking.status
      !==
      "pending_acceptance"
    ) {

      return res.status(400).json({
        message: "Booking already processed"
      });

    }

    /*
    =========================
    SET PAYMENT WINDOW (1 HOUR)
    =========================
    */

    const PAYMENT_WINDOW_MINUTES = 60;

    booking.status =
      "awaiting_payment";

    booking.paymentExpiresAt =
      new Date(
        Date.now() +
        PAYMENT_WINDOW_MINUTES
        *
        60
        *
        1000
      );

    await booking.save();

    /*
    =========================
    CREATE CONVERSATION
    =========================
    */

    const existing =
      await Conversation.findOne({
        booking: booking._id
      });

    if (!existing) {

      await Conversation.create({

        renter:
          booking.renter,

        companion:
          booking.companion,

        booking:
          booking._id

      });

    }

    /*
    =========================
    CREATE NOTIFICATION
    =========================
    */

    await createNotification(
      new Types.ObjectId(
        booking.renter as any
      ),
      "booking_accepted",
      "Booking Accepted",
      "Your booking was accepted. Please complete payment within 1 hour.",
      new Types.ObjectId(
        booking._id as any
      )
    );

    return res.json({

      success: true,
      booking

    });

  }
  catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Accept failed"
    });

  }

};
/*
==================================================
REJECT BOOKING (COMPANION)
==================================================
*/

/*
=========================================
REJECT BOOKING
Companion rejects request
=========================================
*/

export const rejectBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const companionId =
      (req as any).user.userId;

    const { bookingId } =
      req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID required"
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (
      booking.companion.toString()
      !== companionId
    ) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (
      booking.status !==
      "pending_acceptance"
    ) {
      return res.status(400).json({
        message:
          "Booking cannot be rejected"
      });
    }

    booking.status =
      "cancelled";

    await booking.save();

    return res.json({
      message:
        "Booking rejected",
      booking
    });

  }
  catch (error) {

    console.error(
      "REJECT BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reject booking"
    });

  }

};
/*
==================================================
CREATE RAZORPAY ORDER
==================================================
*/

export const createPaymentOrder =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const renterId =
        (req as any).user.userId;

      const { bookingId } =
        req.body;

      const booking =
        await Booking.findById(
          bookingId
        );

      if (!booking)
        return res.status(404).json({
          message:
            "Booking not found"
        });

      if (
        booking.renter.toString()
        !== renterId
      )
        return res.status(403).json({
          message:
            "Not authorized"
        });

      if (
        booking.status
        !== "awaiting_payment"
      )
        return res.status(400).json({
          message:
            "Invalid booking state"
        });

      const razorpay =
        getRazorpayInstance();

      const order =
        await razorpay.orders.create({

          amount:
            booking.totalAmount * 100,

          currency:
            "INR",

          receipt:
            `booking_${booking._id}`

        });

      booking.razorpayOrderId =
        order.id;

      await booking.save();

      res.json(order);

    }
    catch {

      res.status(500).json({
        message:
          "Order creation failed"
      });

    }

  };



/*
==================================================
VERIFY PAYMENT + ESCROW
==================================================
*/



export const payBooking = async (
  req: Request,
  res: Response
) => {
  try {

    const renterId = (req as any).user.userId;

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    /*
    ============================
    VALIDATION
    ============================
    */

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId required"
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.renter.toString() !== renterId) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (booking.status !== "awaiting_payment") {
      return res.status(400).json({
        message: "Invalid booking state"
      });
    }

    if (
      booking.paymentExpiresAt &&
      booking.paymentExpiresAt.getTime() < Date.now()
    ) {
      booking.status = "payment_expired";
      await booking.save();

      return res.status(400).json({
        message: "Payment expired"
      });
    }

    /*
    ============================
    VERIFY SIGNATURE
    ============================
    */

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET as string
      )
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      booking.status = "payment_failed";
      await booking.save();

      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    /*
    ============================
    CALCULATE SERVICE END
    ============================
    */

    const start = new Date(booking.date);
    const [h, m] = booking.startTime
      .split(":")
      .map(Number);

    start.setHours(h);
    start.setMinutes(m);

    const serviceEnd = new Date(
      start.getTime() +
      booking.durationHours * 60 * 60 * 1000
    );

    /*
    ============================
    UPDATE BOOKING
    ============================
    */

    booking.status = "paid_pending_service";
    booking.paymentStatus = "escrowed"; // 🔥 NEW
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.serviceEndedAt = serviceEnd;
    booking.payoutReleased = false;

    await booking.save();

    /*
    ============================
    CREATE TRANSACTION (LEDGER)
    ============================
    */

    const totalAmount = booking.totalAmount ;

    await Transaction.create({
      user: booking.renter,
      booking: booking._id,
      type: "payment",
      amount: totalAmount,
      platformFee: totalAmount * 0.15,
      companionAmount: totalAmount * 0.85,
      status: "completed"
    });

    /*
    ============================
    RESPONSE
    ============================
    */

    return res.json({
      message: "Payment successful",
      booking
    });

  } catch (error) {

    console.error("PAY BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Payment failed"
    });

  }
};

/*
==================================================
CANCEL BOOKING
==================================================
*/


export const cancelBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      (req as any).user.userId;

    const { bookingId } =
      req.params;

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    /*
    =============================
    CHECK PARTICIPATION
    =============================
    */

    const isParticipant =
      booking.renter.toString() === userId ||
      booking.companion.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    /*
    =============================
    ALREADY CLOSED
    =============================
    */

    if (
      booking.status === "cancelled" ||
      booking.status === "completed"
    ) {
      return res.status(400).json({
        message: "Booking cannot be cancelled"
      });
    }

    /*
    =============================
    CHECK SERVICE START TIME
    =============================
    */

    const start = new Date(booking.date);

    const [h, m] =
      booking.startTime
        .split(":")
        .map(Number);

    start.setHours(h);
    start.setMinutes(m);

    if (Date.now() > start.getTime()) {

      return res.status(400).json({
        message:
          "Service already started"
      });

    }

    /*
    =============================
    CANCEL BOOKING
    =============================
    */

    booking.status = "cancelled";

    await booking.save();

    return res.json({

      message: "Booking cancelled",

      booking

    });

  } catch (error) {

    console.error(
      "CANCEL BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel booking"
    });

  }

};

/*
==================================================
COMPLETE BOOKING
==================================================
*/

export const completeBooking =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any).user.userId;

      const { bookingId } =
        req.body;

      const booking =
        await Booking.findById(
          bookingId
        );

      if (!booking)
        return res.status(404).json({
          message:
            "Not found"
        });

      if (
        booking.renter.toString()
        !== userId &&
        booking.companion.toString()
        !== userId
      )
        return res.status(403).json({
          message:
            "Not authorized"
        });

      if (
        booking.status
        !== "paid_pending_service"
      )
        return res.status(400).json({
          message:
            "Invalid state"
        });

      booking.status =
        "completed";

      await booking.save();

      res.json({
        message:
          "Completed"
      });

    }
    catch {

      res.status(500).json({
        message:
          "Complete failed"
      });

    }

  };



/*
==================================================
GET BOOKINGS
==================================================
*/


export const getMyBookings = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user.userId;
    const role = req.user.role;

    let bookings;

    /*
    renter sees their bookings
    */
    if (role === "renter") {

      bookings = await Booking.find({
        renter: userId
      })
      .populate("companion", "name")
      .sort({ createdAt: -1 });

    }

    /*
    companion sees requests sent to them
    */
    else if (role === "companion") {

      bookings = await Booking.find({
        companion: userId
      })
      .populate("renter", "name")
      .sort({ createdAt: -1 });

    }

    else {

      return res.status(403).json({
        message: "Invalid role"
      });

    }

    res.json({
      bookings
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch bookings"
    });

  }

};


/*
==================================================
WALLET
==================================================
*/

export const getMyWallet =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const user =
        await User.findById(
          (req as any).user.userId
        ).select("wallet");

      res.json(
        user?.wallet
      );

    }
    catch {

      res.status(500).json({
        message:
          "Failed"
      });

    }

  };



/*
==================================================
RATE BOOKING
==================================================
*/

export const rateBooking =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any).user.userId;

      const {
        bookingId,
        rating
      } = req.body;

      const booking =
        await Booking.findById(
          bookingId
        );

      if (!booking)
        return res.status(404).json({
          message:
            "Not found"
        });

      let target;

      if (
        booking.renter.toString()
        === userId
      ) {

        booking.renterRating =
          rating;

        target =
          booking.companion;

      }
      else {

        booking.companionRating =
          rating;

        target =
          booking.renter;

      }

      await booking.save();

      const user =
        await User.findById(
          target
        );

      if (user) {

        const total =
          user.totalRatings + 1;

        const avg =
          (
            user.averageRating
            *
            user.totalRatings
            +
            rating
          )
          / total;

        user.totalRatings =
          total;

        user.averageRating =
          Number(
            avg.toFixed(2)
          );

        await user.save();

      }

      res.json({
        message:
          "Rated"
      });

    }
    catch {

      res.status(500).json({
        message:
          "Rating failed"
      });

    }

  };



/*
==================================================
CHAT GUARD
==================================================
*/

export const canChat =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any).user.userId;

      const {
        otherUserId
      } = req.params;

      const booking =
        await Booking.findOne({

          status: {
            $in: [
              "paid_pending_service",
              "completed"
            ]
          },

          $or: [

            {
              renter: userId,
              companion:
                otherUserId
            },

            {
              renter:
                otherUserId,
              companion:
                userId
            }

          ]

        });

      res.json({
        allowed:
          !!booking
      });

    }
    catch {

      res.json({
        allowed: false
      });

    }

  };




  export const raiseDispute = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = (req as any).user.userId;

    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      return res.status(400).json({
        message: "bookingId and reason required"
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const isRenter =
      booking.renter.toString() === userId;

    const isCompanion =
      booking.companion.toString() === userId;

    if (!isRenter && !isCompanion) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (booking.dispute?.isRaised) {
      return res.status(400).json({
        message: "Dispute already raised"
      });
    }

    booking.dispute = {
      isRaised: true,
      raisedBy: userId,
      reason,
      status: "under_review",
      createdAt: new Date()
    };

    booking.status = "under_review";

    await booking.save();

    res.json({
      message: "Dispute raised successfully"
    });

  }
  catch (error) {

    console.error("DISPUTE ERROR:", error);

    res.status(500).json({
      message: "Failed to raise dispute"
    });

  }

};


export const getInboxCount =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as any).user.userId;

      const count =
        await Booking.countDocuments({
          companion: userId,
          status:
            "pending_acceptance"
        });

      res.json({
        count
      });

    }
    catch {

      res.status(500).json({
        count: 0
      });

    }

};




export const getBookingHistory = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user.userId;
    const role = req.user.role;

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 20;

    const status =
      req.query.status as string;

    const skip =
      (page - 1) * limit;

    const filter: any = {};

    /*
    ROLE BASED FILTER
    */

    if (role === "renter") {
      filter.renter = userId;
    }

    if (role === "companion") {
      filter.companion = userId;
    }

    if (status) {
      filter.status = status;
    }

    const bookings =
      await Booking.find(filter)
        .populate("renter", "name")
        .populate("companion", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total =
      await Booking.countDocuments(filter);

    return res.json({

      bookings,

      pagination: {

        total,

        page,

        pages:
          Math.ceil(total / limit)

      }

    });

  }
  catch (error) {

    console.error(
      "BOOKING HISTORY ERROR:",
      error
    );

    return res.status(500).json({

      message:
        "Failed to fetch booking history"

    });

  }

};


export const getBookingById = async (
  req: Request,
  res: Response
) => {

  try {

    const { bookingId } = req.params;

    const booking =
      await Booking
        .findById(bookingId)
        .populate("companion", "name");

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }

    return res.json({ booking });

  }
  catch (error) {

    console.error(
      "GET BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch booking"
    });

  }

};