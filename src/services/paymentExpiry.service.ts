import { Booking } from "../models/Booking.model";

export const runPaymentExpiry =
  async () => {

    try {

      const now =
        new Date();

      const expired =
        await Booking.find({

          status:
            "awaiting_payment",

          paymentExpiresAt: {
            $lte: now
          }

        });


      for (const booking
        of expired) {

        booking.status =
          "payment_expired";

        await booking.save();

        console.log(
          "PAYMENT EXPIRED:",
          booking._id
        );

      }

    }
    catch (error) {

      console.error(
        "PAYMENT EXPIRY ERROR:",
        error
      );

    }

};