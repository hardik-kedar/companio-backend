import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";


/*
=====================================
GET ALL DISPUTES
=====================================
*/

export const getAllDisputes = async (
  req: Request,
  res: Response
) => {
  try {

    const disputes = await Booking.find({
      "dispute.isRaised": true
    })
      .populate("renter", "name email")
      .populate("companion", "name email")
      .sort({ createdAt: -1 });

    res.json(disputes);

  } catch (error) {

    console.error("GET DISPUTES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch disputes"
    });

  }
};



/*
=====================================
RESOLVE DISPUTE
=====================================
ACTION:
refund → renter gets money
release → companion gets money
=====================================
*/

export const resolveDispute = async (
  req: Request,
  res: Response
) => {

  try {

    const { bookingId, action } = req.body;

    if (!bookingId || !action) {
      return res.status(400).json({
        message: "bookingId and action required"
      });
    }

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (!booking.dispute?.isRaised) {
      return res.status(400).json({
        message: "No dispute on this booking"
      });
    }


    /*
    ==============================
    REFUND RENTER
    ==============================
    */

    if (action === "refund") {

      booking.dispute.status =
        "resolved_refund";

      booking.status = "cancelled";

      await booking.save();

      return res.json({
        message: "Refund approved"
      });

    }


    /*
    ==============================
    RELEASE TO COMPANION
    ==============================
    */

    if (action === "release") {

      booking.dispute.status =
        "resolved_release";

      booking.status = "completed";

      /*
      Wallet payout happens here later
      */

      await booking.save();

      return res.json({
        message: "Payment released"
      });

    }


    return res.status(400).json({
      message: "Invalid action"
    });


  }
  catch (error) {

    console.error(
      "RESOLVE DISPUTE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to resolve dispute"
    });

  }

};




export const getAllBookings = async (
  req: Request,
  res: Response
) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const bookings =
      await Booking.find(filter)
        .populate("renter", "name email")
        .populate("companion", "name email")
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
        pages: Math.ceil(total / limit)
      }

    });

  } catch (error) {

    console.error(
      "ADMIN GET BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch bookings"
    });

  }

};


export const adminCancelBooking = async (
  req: Request,
  res: Response
) => {

  try {

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

    if (
      booking.status === "cancelled" ||
      booking.status === "completed"
    ) {
      return res.status(400).json({
        message:
          "Booking cannot be cancelled"
      });
    }

    booking.status = "cancelled";

    await booking.save();

    return res.json({

      message:
        "Booking cancelled by admin",

      booking

    });

  } catch (error) {

    console.error(
      "ADMIN CANCEL BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel booking"
    });

  }

};