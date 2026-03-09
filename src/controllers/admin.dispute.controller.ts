import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
import Transaction from "../models/Transaction.model";

/*
========================================
GET ALL DISPUTES
========================================
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

    res.json({
      disputes
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch disputes"
    });

  }

};


/*
========================================
REFUND RENTER
========================================
*/

export const refundBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.status(404).json({
        message: "Booking not found"
      });

    if (!booking.dispute.isRaised)
      return res.status(400).json({
        message: "No dispute"
      });


    booking.status = "cancelled";

    booking.dispute.status = "resolved_refund";

    booking.payoutReleased = true;

    await booking.save();


    res.json({
      message: "Refund approved"
    });

  }
  catch (error) {

    res.status(500).json({
      message: "Refund failed"
    });

  }

};


/*
========================================
RELEASE PAYOUT TO COMPANION
========================================
*/

export const releasePayout = async (
  req: Request,
  res: Response
) => {

  try {

    const { bookingId } = req.params;

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking)
      return res.status(404).json({
        message: "Booking not found"
      });

    const companion = await User.findById(
      booking.companion
    );

    if (!companion)
      return res.status(404).json({
        message: "Companion not found"
      });


companion.wallet.pending = Math.max(
  0,
  companion.wallet.pending - booking.companionEarning
);

companion.wallet.balance += booking.companionEarning;

companion.wallet.totalEarned += booking.companionEarning;

    await companion.save();


    booking.status = "completed";

    booking.payoutReleased = true;

    booking.dispute.status =
      "resolved_release";

    await booking.save();


    res.json({
      message: "Payout released"
    });

  }
  catch (error) {

    res.status(500).json({
      message: "Release failed"
    });

  }

};



export const resolveDisputeRefund = async (
  req: Request,
  res: Response
) => {
  try {

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (!booking.dispute.isRaised) {
      return res.status(400).json({
        message: "No dispute raised"
      });
    }

    /*
    ============================
    REFUND LOGIC
    ============================
    */

    booking.paymentStatus = "refunded";
    booking.status = "cancelled";
    booking.payoutReleased = false;

    booking.dispute.status = "resolved_refund";

    await booking.save();

    /*
    ============================
    CREDIT RENTER WALLET
    ============================
    */

    await User.findByIdAndUpdate(
      booking.renter,
      {
        $inc: {
          walletBalance: booking.totalAmount
        }
      }
    );

    /*
    ============================
    CREATE REFUND TRANSACTION
    ============================
    */

    await Transaction.create({

      user: booking.renter,

      booking: booking._id,

      type: "refund",

      amount: booking.totalAmount,

      platformFee: 0,

      companionAmount: 0,

      status: "completed"

    });

    return res.json({
      message: "Refund processed successfully"
    });

  } catch (error) {

    console.error("REFUND ERROR:", error);

    return res.status(500).json({
      message: "Refund failed"
    });

  }
};


export const resolveDisputeRelease = async (
  req: Request,
  res: Response
) => {
  try {

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    booking.dispute.status = "resolved_release";
    booking.status = "completed";
    booking.paymentStatus = "released";
    booking.payoutReleased = true;

    await booking.save();

    await User.findByIdAndUpdate(
      booking.companion,
      {
        $inc: {
          walletBalance: booking.companionEarning
        }
      }
    );

    await Transaction.create({

      user: booking.companion,

      booking: booking._id,

      type: "payout",

      amount: booking.companionEarning,

      platformFee: booking.platformFee,

      companionAmount: booking.companionEarning,

      status: "completed"

    });

    return res.json({
      message: "Payout released manually"
    });

  } catch (error) {

    console.error("RELEASE ERROR:", error);

    return res.status(500).json({
      message: "Release failed"
    });

  }
};