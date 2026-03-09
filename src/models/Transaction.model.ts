import mongoose, { Schema, Types } from "mongoose";

interface Transaction {

  user: Types.ObjectId;

  booking: Types.ObjectId | null;

  type:
    | "payment"
    | "commission"
    | "payout"
    | "refund";

  amount: number;

  platformFee: number;

  companionAmount: number;

  status:
    | "pending"
    | "completed"
    | "failed";

}

const transactionSchema =
  new Schema<Transaction>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
        required: true
      },

      type: {
        type: String,
        enum: [
          "payment",
          "commission",
          "payout",
          "refund"
        ],
        required: true
      },

      amount: {
        type: Number,
        required: true
      },

      platformFee: {
        type: Number,
        default: 0
      },

      companionAmount: {
        type: Number,
        default: 0
      },

      status: {
        type: String,
        enum: [
          "pending",
          "completed",
          "failed"
        ],
        default: "completed"
      }

    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "Transaction",
  transactionSchema
);