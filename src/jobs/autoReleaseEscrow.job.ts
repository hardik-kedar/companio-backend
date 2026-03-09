import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
import Transaction from "../models/Transaction.model";

export const runAutoReleaseEscrow = async () => {
  try {

    const now = new Date();

    const bookings = await Booking.find({
      paymentStatus: "escrowed",
      payoutReleased: false,
      serviceEndedAt: { $lte: now },
      "dispute.status": "none"
    });

    for (const booking of bookings) {

      const companion = await User.findById(
        booking.companion
      );

      if (!companion) continue;

      // Move money to wallet
      companion.wallet.balance += booking.companionEarning;
      companion.wallet.totalEarned += booking.companionEarning;

      await companion.save();

      // Update booking
      booking.paymentStatus = "released";
      booking.payoutReleased = true;
      booking.status = "completed";

      await booking.save();

      // Ledger record
      await Transaction.create({
        user: booking.companion,
        booking: booking._id,
        type: "payout_release",
        amount: booking.companionEarning,
        platformFee: 0,
        companionAmount: booking.companionEarning,
        status: "completed"
      });

      console.log("Escrow released:", booking._id);
    }

  } catch (err) {
    console.error("AUTO RELEASE ERROR:", err);
  }
};