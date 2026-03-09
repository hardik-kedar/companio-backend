import mongoose, {
  Schema,
  Document,
  Types
} from "mongoose";

/*
========================================
BOOKING STATUS ENUM
========================================
*/

export type BookingStatus =
  | "pending_acceptance"
  | "expired"
  | "awaiting_payment"
  | "payment_expired"
  | "payment_failed"
  | "paid_pending_service"
  | "completed"
  | "cancelled"
  | "under_review";

/*
========================================
DISPUTE STATUS ENUM
========================================
*/

export type DisputeStatus =
  | "none"
  | "under_review"
  | "resolved_refund"
  | "resolved_release";

/*
========================================
DISPUTE TYPE
========================================
*/

export interface IDispute {
  isRaised: boolean;
  raisedBy?: Types.ObjectId;
  reason?: string;
  status: DisputeStatus;
  createdAt?: Date;
}

/*
========================================
BOOKING DOCUMENT TYPE
========================================
*/

export interface IBooking extends Document {

  renter: Types.ObjectId;
  companion: Types.ObjectId;

  date: Date;
  startTime: string;
  durationHours: number;

  locationText: string;
  message?: string;

  pricePerHour: number;
  totalAmount: number;

  platformFee: number;
  companionEarning: number;

  status: BookingStatus;

  paymentStatus:
    | "unpaid"
    | "paid"
    | "escrowed"
    | "released"
    | "refunded";

  expiresAt?: Date;
  paymentExpiresAt?: Date;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  renterRating?: number;
  companionRating?: number;

  dispute: IDispute;

  payoutReleased: boolean;
  serviceEndedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/*
========================================
DISPUTE SUBSCHEMA
========================================
*/

const disputeSchema = new Schema<IDispute>(
  {
    isRaised: {
      type: Boolean,
      default: false
    },

    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reason: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: [
        "none",
        "under_review",
        "resolved_refund",
        "resolved_release"
      ],
      default: "none"
    },

    createdAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

/*
========================================
MAIN BOOKING SCHEMA
========================================
*/

const bookingSchema = new Schema<IBooking>(
  {

    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    companion: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    durationHours: {
      type: Number,
      required: true
    },

    locationText: {
      type: String,
      required: true
    },

    message: String,

    pricePerHour: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    platformFee: {
      type: Number,
      required: true
    },

    companionEarning: {
      type: Number,
      required: true
    },

    payoutReleased: {
      type: Boolean,
      default: false
    },

    serviceEndedAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "pending_acceptance",
        "expired",
        "awaiting_payment",
        "payment_expired",
        "payment_failed",
        "paid_pending_service",
        "completed",
        "cancelled",
        "under_review"
      ],
      default: "pending_acceptance"
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "paid",
        "escrowed",
        "released",
        "refunded"
      ],
      default: "unpaid"
    },

    expiresAt: Date,
    paymentExpiresAt: Date,

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    renterRating: Number,
    companionRating: Number,

    dispute: {
      type: disputeSchema,
      default: () => ({
        isRaised: false,
        status: "none"
      })
    }

  },
  { timestamps: true }
);

/*
========================================
INDEXES
========================================
*/

bookingSchema.index({ renter: 1, createdAt: -1 });
bookingSchema.index({ companion: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ payoutReleased: 1, serviceEndedAt: 1 });
bookingSchema.index({ "dispute.status": 1 });

export const Booking =
  mongoose.model<IBooking>(
    "Booking",
    bookingSchema
  );