import { Booking } from "../models/Booking.model";

export const runBookingExpiry = async () => {

  try {

    const now = new Date();

    const expiredBookings =
      await Booking.find({
        status: "pending_acceptance",
        expiresAt: { $lte: now }
      });

    for (const booking of expiredBookings) {

      booking.status = "expired";

      await booking.save();

      console.log(
        "BOOKING EXPIRED:",
        booking._id.toString()
      );

    }

  }
  catch (error) {

    console.error(
      "BOOKING EXPIRY ERROR:",
      error
    );

  }

};