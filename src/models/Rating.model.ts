import mongoose, { Schema, Document } from "mongoose";

export interface IRating extends Document {
  reviewer: mongoose.Types.ObjectId;      // Who gave rating
  reviewedUser: mongoose.Types.ObjectId;  // Who received rating
  booking: mongoose.Types.ObjectId;       // Booking reference

  rating: number;                         // 1–5 stars
  comment?: string;

  isDeleted: boolean;                     // Admin soft delete
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      maxlength: 500,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ========================================
   INDEXES (Performance + Integrity)
======================================== */

// Prevent duplicate rating for same booking
RatingSchema.index(
  { reviewer: 1, booking: 1 },
  { unique: true }
);

// Fast lookup for user profile ratings
RatingSchema.index({ reviewedUser: 1 });

export const Rating = mongoose.model<IRating>(
  "Rating",
  RatingSchema
);