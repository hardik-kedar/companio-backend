import cron from "node-cron";
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
/*
Runs every 5 minutes
*/

export const startBookingAutoCompleteJob = () => {

  cron.schedule("*/5 * * * *", async () => {

    try {

      const now = new Date();

      /*
      Find bookings that:

      • paid_pending_service
      • end time already passed
      */

const bookings =
await Booking.find({

  status: "paid",

  endTime: {
    $lt: new Date()
  }

});

      for (const booking of bookings) {

  booking.status = "completed";

  await booking.save();

  await User.findByIdAndUpdate(
    booking.companion,
    {
      $inc: {
        "wallet.pendingBalance":
          -booking.companionEarning,

        "wallet.balance":
          booking.companionEarning,

        "wallet.totalEarned":
          booking.companionEarning
      }
    }
  );

  console.log(
    "Booking completed & wallet updated:",
    booking._id
  );

}

    }
    catch (error) {

      console.error(
        "Auto complete job error:",
        error
      );

    }

  });

};