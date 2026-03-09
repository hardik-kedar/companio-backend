import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";

export const runAutoPayout = async () => {

  try {

    const now = new Date();

    const eligibleBookings = await Booking.find({

      status: "paid_pending_service",

      payoutReleased: false,

      serviceEndedAt: {
        $lte: new Date(
          now.getTime() - 30 * 60 * 1000
        )
      },

      "dispute.isRaised": false

    });

    for (const booking of eligibleBookings) {

      const companion = await User.findById(
        booking.companion
      );

      if (!companion) continue;


      /*
      SAFE UPDATE
      */

      companion.wallet.balance =
        (companion.wallet.balance || 0)
        + booking.companionEarning;

      companion.wallet.totalEarned =
        (companion.wallet.totalEarned || 0)
        + booking.companionEarning;


      await companion.save();


      booking.status = "completed";

      booking.payoutReleased = true;


      await booking.save();


      console.log(
        "PAYOUT RELEASED:",
        booking._id.toString()
      );

    }

  }
  catch (error) {

    console.error(
      "AUTO PAYOUT ERROR:",
      error
    );

  }

};