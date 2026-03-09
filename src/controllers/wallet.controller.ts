// import { Request, Response } from "express";
// import { User } from "../models/User.model";
// import Transaction from "../models/Transaction.model";
// import { Withdrawal } from "../models/Withdrawal.model";

// /*
// ========================================
// GET MY WALLET
// GET /api/wallet/me
// ========================================
// */
// export const getMyWallet = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const userId = (req as any).user.userId;

//     /*
//     ============================
//     USER WALLET
//     ============================
//     */

//     const user = await User.findById(userId)
//       .select("wallet");

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     /*
//     ============================
//     RECENT TRANSACTIONS
//     ============================
//     */

//     const transactions =
//       await Transaction.find({
//         user: userId
//       })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     /*
//     ============================
//     RECENT WITHDRAWALS
//     ============================
//     */

//     const withdrawals =
//       await Withdrawal.find({
//         user: userId
//       })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     return res.json({

//       wallet: user.wallet,

//       transactions,

//       withdrawals

//     });

//   } catch (error) {

//     console.error("WALLET ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to load wallet"
//     });

//   }
// };


// /*
// ========================================
// GET MY WALLET
// GET /api/wallet/me
// ========================================
// */
// export const requestWithdrawal = async (
//   req: Request,
//   res: Response
// ) => {

//   const userId = (req as any).user.userId;
//   const { amount } = req.body;

//   const user = await User.findById(userId);

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   if (user.wallet.balance < amount)
//     return res.status(400).json({
//       message: "Insufficient balance"
//     });

//   const withdrawal = await Withdrawal.create({
//     user: userId,
//     amount,
//     status: "pending"
//   });

//   res.json({
//     message: "Withdrawal requested",
//     withdrawal
//   });

// };


import { Request, Response } from "express";
import { User } from "../models/User.model";
import Transaction from "../models/Transaction.model";
import { Withdrawal } from "../models/Withdrawal.model";

/*
========================================
GET MY WALLET
GET /api/wallet/me
========================================
*/
export const getMyWallet = async (
  req: Request,
  res: Response
) => {
  try {

    const userId = (req as any).user.userId;

    /*
    ============================
    USER WALLET
    ============================
    */

    const user = await User.findById(userId)
      .select("wallet");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
    ============================
    RECENT TRANSACTIONS
    ============================
    */

    const transactions =
      await Transaction.find({
        user: userId
      })
      .sort({ createdAt: -1 })
      .limit(10);

    /*
    ============================
    RECENT WITHDRAWALS
    ============================
    */

    const withdrawals =
      await Withdrawal.find({
        user: userId
      })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({

      wallet: user.wallet,

      transactions,

      withdrawals

    });

  } catch (error) {

    console.error("WALLET ERROR:", error);

    return res.status(500).json({
      message: "Failed to load wallet"
    });

  }
};


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

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({
        message: "User not found"
      });

    if (user.wallet.balance < amount)
      return res.status(400).json({
        message: "Insufficient balance"
      });

    /*
    ============================
    PREVENT MULTIPLE WITHDRAWALS
    ============================
    */

    const existingPending = await Withdrawal.findOne({
      user: userId,
      status: { $in: ["pending", "processing"] }
    });

    if (existingPending)
      return res.status(400).json({
        message: "You already have a withdrawal in progress"
      });

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      status: "pending"
    });

    res.json({
      message: "Withdrawal requested",
      withdrawal
    });

  } catch (error) {

    console.error("WITHDRAW REQUEST ERROR:", error);

    res.status(500).json({
      message: "Failed to request withdrawal"
    });

  }

};