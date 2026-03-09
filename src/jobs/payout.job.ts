import { Booking } from "../models/Booking.model";
import Transaction from "../models/Transaction.model";
import { User } from "../models/User.model";

export const runPayoutJob = async () => {

  try {

    const now = new Date();

    /*
    ====================================
    FIND BOOKINGS READY FOR RELEASE
    ====================================
    */

    const bookings = await Booking.find({

      status: "paid_pending_service",

      paymentStatus: "escrowed",

      payoutReleased: false,

      serviceEndedAt: { $lte: now },

      "dispute.status": "none"

    });

    for (const booking of bookings) {

      /*
      ====================================
      CREDIT COMPANION WALLET
      ====================================
      */

      await User.findByIdAndUpdate(
        booking.companion,
        {
          $inc: {
            walletBalance: booking.companionEarning
          }
        }
      );

      /*
      ====================================
      UPDATE BOOKING
      ====================================
      */

      booking.status = "completed";
      booking.paymentStatus = "released";
      booking.payoutReleased = true;

      await booking.save();

      /*
      ====================================
      CREATE PAYOUT TRANSACTION
      ====================================
      */

      await Transaction.create({

        user: booking.companion,

        booking: booking._id,

        type: "payout",

        amount: booking.companionEarning,

        platformFee: booking.platformFee,

        companionAmount: booking.companionEarning,

        status: "completed"

      });

      console.log(
        "Payout released for booking:",
        booking._id
      );

    }

  } catch (error) {

    console.error("PAYOUT JOB ERROR:", error);

  }

};