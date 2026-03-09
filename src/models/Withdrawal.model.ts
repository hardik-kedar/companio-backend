// import mongoose, {
//   Schema,
//   Document,
//   Types
// } from "mongoose";

// /*
// ========================================
// WITHDRAWAL STATUS ENUM
// ========================================
// */

// export type WithdrawalStatus =
//   | "pending"      // requested by companion
//   | "approved"     // approved by admin
//   | "rejected"     // rejected by admin
//   | "processing"   // payout initiated
//   | "paid";        // payout completed


// /*
// ========================================
// WITHDRAWAL DOCUMENT TYPE
// ========================================
// */

// export interface IWithdrawal extends Document {

//   user: Types.ObjectId;           // companion

//   amount: number;

//   status: WithdrawalStatus;

//   /*
//   Snapshot of bank details
//   (important in case user edits later)
//   */
//   bankDetails: {
//     accountHolderName: string;
//     accountNumber: string;
//     ifscCode: string;
//     bankName: string;
//   };

//   /*
//   Admin processing fields
//   */
//   processedBy?: Types.ObjectId;
//   processedAt?: Date;
//   rejectionReason?: string;

//   /*
//   External payout reference
//   (Razorpay payout ID later)
//   */
//   payoutReferenceId?: string;

//   createdAt: Date;
//   updatedAt: Date;
// }


// /*
// ========================================
// WITHDRAWAL SCHEMA
// ========================================
// */

// const withdrawalSchema =
//   new Schema<IWithdrawal>(
//     {

//       user: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//         index: true
//       },

//       amount: {
//         type: Number,
//         required: true,
//         min: 1
//       },

//       status: {
//         type: String,
//         enum: [
//           "pending",
//           "approved",
//           "rejected",
//           "processing",
//           "paid"
//         ],
//         default: "pending",
//         index: true
//       },

//       bankDetails: {
//         accountHolderName: {
//           type: String,
//           required: true
//         },

//         accountNumber: {
//           type: String,
//           required: true
//         },

//         ifscCode: {
//           type: String,
//           required: true
//         },

//         bankName: {
//           type: String,
//           required: true
//         }
//       },

//       processedBy: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         default: null
//       },

//       processedAt: {
//         type: Date,
//         default: null
//       },

//       rejectionReason: {
//         type: String,
//         default: null
//       },

//       payoutReferenceId: {
//         type: String,
//         default: null
//       }

//     },
//     {
//       timestamps: true
//     }
//   );


// /*
// ========================================
// PRODUCTION INDEXES
// ========================================
// */

// // Admin dashboard queries
// withdrawalSchema.index({ status: 1, createdAt: -1 });

// // User history
// withdrawalSchema.index({ user: 1, createdAt: -1 });


// export const Withdrawal =
//   mongoose.model<IWithdrawal>(
//     "Withdrawal",
//     withdrawalSchema
//   );


import mongoose, {
  Schema,
  Document,
  Types
} from "mongoose";

/*
========================================
WITHDRAWAL STATUS ENUM
========================================
*/

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "paid";


/*
========================================
WITHDRAWAL DOCUMENT TYPE
========================================
*/

export interface IWithdrawal extends Document {

  user: Types.ObjectId;

  amount: number;

  status: WithdrawalStatus;

  /*
  Optional snapshot of bank details
  (can be added later)
  */
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };

  processedBy?: Types.ObjectId;

  processedAt?: Date;

  rejectionReason?: string;

  payoutReferenceId?: string;

  createdAt: Date;

  updatedAt: Date;
}


/*
========================================
WITHDRAWAL SCHEMA
========================================
*/

const withdrawalSchema =
  new Schema<IWithdrawal>(
    {

      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      amount: {
        type: Number,
        required: true,
        min: 1
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
          "processing",
          "paid"
        ],
        default: "pending",
        index: true
      },

      /*
      BANK DETAILS (OPTIONAL)
      */

      bankDetails: {

        accountHolderName: {
          type: String,
          default: null
        },

        accountNumber: {
          type: String,
          default: null
        },

        ifscCode: {
          type: String,
          default: null
        },

        bankName: {
          type: String,
          default: null
        }

      },

      processedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
      },

      processedAt: {
        type: Date,
        default: null
      },

      rejectionReason: {
        type: String,
        default: null
      },

      payoutReferenceId: {
        type: String,
        default: null
      }

    },
    {
      timestamps: true
    }
  );


/*
========================================
PRODUCTION INDEXES
========================================
*/

// Admin dashboard queries
withdrawalSchema.index({ status: 1, createdAt: -1 });

// User history
withdrawalSchema.index({ user: 1, createdAt: -1 });


export const Withdrawal =
  mongoose.model<IWithdrawal>(
    "Withdrawal",
    withdrawalSchema
  );