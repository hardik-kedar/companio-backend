import { Request, Response } from "express";
import { Withdrawal } from "../models/Withdrawal.model";
import { User } from "../models/User.model";

/*
========================================
REQUEST WITHDRAWAL
POST /api/withdrawals/request
========================================
*/


export const requestWithdrawal = async (
  req: Request,
  res: Response
) => {
  try {

    const userId = (req as any).user.userId;

    const { amount } = req.body;

    /*
    ================================
    VALIDATION
    ================================
    */

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid withdrawal amount required"
      });
    }

    /*
    ================================
    FETCH USER
    ================================
    */

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
    ================================
    ONLY COMPANIONS CAN WITHDRAW
    ================================
    */

    if (user.role !== "companion") {
      return res.status(403).json({
        message: "Only companions can withdraw"
      });
    }

    /*
    ================================
    MINIMUM WITHDRAWAL RULE
    ================================
    */

    const MIN_WITHDRAWAL = 500;

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}`
      });
    }

    /*
    ================================
    BALANCE CHECK
    ================================
    */

    if (user.wallet.balance < amount) {
      return res.status(400).json({
        message: "Insufficient wallet balance"
      });
    }

    /*
    ================================
    PREVENT MULTIPLE PENDING
    ================================
    */

    const existingPending = await Withdrawal.findOne({
      user: userId,
      status: { $in: ["pending", "approved", "processing"] }
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a withdrawal in progress"
      });
    }

    /*
    ================================
    CREATE WITHDRAWAL RECORD
    ================================
    */

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      status: "pending"
    });

    /*
    ================================
    SUCCESS RESPONSE
    ================================
    */

    return res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal
    });

  } catch (error) {

    console.error("WITHDRAWAL REQUEST ERROR:", error);

    return res.status(500).json({
      message: "Failed to request withdrawal"
    });

  }
};


// export const requestWithdrawal = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const userId = (req as any).user.userId;
//     const { amount, bankDetails } = req.body;

//     /*
//     ================================
//     VALIDATION
//     ================================
//     */

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         message: "Valid withdrawal amount required"
//       });
//     }

//     if (!bankDetails ||
//         !bankDetails.accountHolderName ||
//         !bankDetails.accountNumber ||
//         !bankDetails.ifscCode ||
//         !bankDetails.bankName
//     ) {
//       return res.status(400).json({
//         message: "Complete bank details required"
//       });
//     }

//     /*
//     ================================
//     FETCH USER
//     ================================
//     */

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     if (user.role !== "companion") {
//       return res.status(403).json({
//         message: "Only companions can withdraw"
//       });
//     }

//     /*
//     ================================
//     MINIMUM WITHDRAWAL RULE
//     ================================
//     */

//     const MIN_WITHDRAWAL = 500;

//     if (amount < MIN_WITHDRAWAL) {
//       return res.status(400).json({
//         message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}`
//       });
//     }

//     /*
//     ================================
//     BALANCE CHECK
//     ================================
//     */

//     if (user.wallet.balance < amount) {
//       return res.status(400).json({
//         message: "Insufficient wallet balance"
//       });
//     }

//     /*
//     ================================
//     PREVENT MULTIPLE PENDING
//     ================================
//     */

//     const existingPending = await Withdrawal.findOne({
//       user: userId,
//       status: { $in: ["pending", "approved", "processing"] }
//     });

//     if (existingPending) {
//       return res.status(400).json({
//         message: "You already have a withdrawal in progress"
//       });
//     }

//     /*
//     ================================
//     CREATE WITHDRAWAL RECORD
//     ================================
//     */

//     const withdrawal = await Withdrawal.create({
//       user: userId,
//       amount,
//       bankDetails,
//       status: "pending"
//     });

//     return res.status(201).json({
//       message: "Withdrawal request submitted",
//       withdrawal
//     });

//   } catch (error) {

//     console.error("WITHDRAWAL REQUEST ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to request withdrawal"
//     });

//   }
// };