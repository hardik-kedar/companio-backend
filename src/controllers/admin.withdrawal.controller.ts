// import { Request, Response } from "express";
// import { Withdrawal } from "../models/Withdrawal.model";
// import { User } from "../models/User.model";
// import Transaction from "../models/Transaction.model";

// /*
// ========================================
// ADMIN APPROVE WITHDRAWAL
// POST /api/admin/withdrawals/:id/approve
// ========================================
// */

// export const approveWithdrawal = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const { id } = req.params;

//     const withdrawal = await Withdrawal.findById(id);

//     if (!withdrawal) {
//       return res.status(404).json({
//         message: "Withdrawal not found"
//       });
//     }

//     if (withdrawal.status !== "pending") {
//       return res.status(400).json({
//         message: "Withdrawal already processed"
//       });
//     }

//     const user = await User.findById(withdrawal.user);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     /*
//     ===============================
//     DEDUCT WALLET BALANCE
//     ===============================
//     */

//     if (user.wallet.balance < withdrawal.amount) {
//       return res.status(400).json({
//         message: "Insufficient wallet balance"
//       });
//     }

//     user.wallet.balance -= withdrawal.amount;

//     await user.save();

//     /*
//     ===============================
//     UPDATE WITHDRAWAL STATUS
//     ===============================
//     */

//     withdrawal.status = "approved";
//     withdrawal.processedAt = new Date();
//     withdrawal.processedBy = (req as any).user.userId;

//     await withdrawal.save();

//     return res.json({
//       message: "Withdrawal approved"
//     });

//   } catch (error) {

//     console.error("APPROVE WITHDRAW ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to approve withdrawal"
//     });

//   }
// };
// /*
// ========================================
// ADMIN REJECT WITHDRAWAL
// POST /api/admin/withdrawals/:id/reject
// ========================================
// */

// export const rejectWithdrawal = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const adminId = (req as any).user.userId;
//     const { id } = req.params;
//     const { reason } = req.body;

//     if (!reason) {
//       return res.status(400).json({
//         message: "Rejection reason required"
//       });
//     }

//     const withdrawal = await Withdrawal.findById(id);

//     if (!withdrawal) {
//       return res.status(404).json({
//         message: "Withdrawal not found"
//       });
//     }

//     if (withdrawal.status !== "pending") {
//       return res.status(400).json({
//         message: "Withdrawal already processed"
//       });
//     }

//     withdrawal.status = "rejected";
//     withdrawal.rejectionReason = reason;
//     withdrawal.processedBy = adminId;
//     withdrawal.processedAt = new Date();

//     await withdrawal.save();

//     return res.json({
//       message: "Withdrawal rejected successfully"
//     });

//   } catch (error) {

//     console.error("REJECT WITHDRAWAL ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to reject withdrawal"
//     });

//   }
// };



// /*
// ========================================
// GET ALL WITHDRAWALS (ADMIN)
// GET /api/admin/withdrawals
// ========================================
// */

// export const getAllWithdrawals = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 20;
//     const status = req.query.status as string;

//     const skip = (page - 1) * limit;

//     /*
//     ================================
//     FILTER
//     ================================
//     */

//     const filter: any = {};

//     if (status) {
//       filter.status = status;
//     }

//     /*
//     ================================
//     FETCH WITHDRAWALS
//     ================================
//     */

//     const withdrawals = await Withdrawal.find(filter)
//       .populate("user", "name email city")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Withdrawal.countDocuments(filter);

//     return res.json({
//       withdrawals,
//       pagination: {
//         total,
//         page,
//         pages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {

//     console.error("GET WITHDRAWALS ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to fetch withdrawals"
//     });

//   }
// };


import { Request, Response } from "express";
import { Withdrawal } from "../models/Withdrawal.model";
import { User } from "../models/User.model";
import Transaction from "../models/Transaction.model";

/*
========================================
ADMIN APPROVE WITHDRAWAL
POST /api/admin/withdrawals/:id/approve
========================================
*/

export const approveWithdrawal = async (
  req: Request,
  res: Response
) => {
  try {

    const adminId = (req as any).user.userId;
    const { id } = req.params;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found"
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        message: "Withdrawal already processed"
      });
    }

    const user = await User.findById(withdrawal.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
    ===============================
    WALLET BALANCE CHECK
    ===============================
    */

    if (user.wallet.balance < withdrawal.amount) {
      return res.status(400).json({
        message: "Insufficient wallet balance"
      });
    }

    /*
    ===============================
    DEDUCT WALLET BALANCE
    ===============================
    */

    user.wallet.balance -= withdrawal.amount;

    await user.save();

    /*
    ===============================
    CREATE TRANSACTION RECORD
    ===============================
    */

    await Transaction.create({
      user: user._id,
      type: "withdrawal",
      amount: withdrawal.amount,
      status: "completed",
      // reference: withdrawal._id
    });

    /*
    ===============================
    UPDATE WITHDRAWAL STATUS
    ===============================
    */

    withdrawal.status = "approved";
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.json({
      message: "Withdrawal approved successfully"
    });

  } catch (error) {

    console.error("APPROVE WITHDRAW ERROR:", error);

    return res.status(500).json({
      message: "Failed to approve withdrawal"
    });

  }
};


/*
========================================
ADMIN REJECT WITHDRAWAL
POST /api/admin/withdrawals/:id/reject
========================================
*/

export const rejectWithdrawal = async (
  req: Request,
  res: Response
) => {
  try {

    const adminId = (req as any).user.userId;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason required"
      });
    }

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found"
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        message: "Withdrawal already processed"
      });
    }

    withdrawal.status = "rejected";
    withdrawal.rejectionReason = reason;
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.json({
      message: "Withdrawal rejected successfully"
    });

  } catch (error) {

    console.error("REJECT WITHDRAWAL ERROR:", error);

    return res.status(500).json({
      message: "Failed to reject withdrawal"
    });

  }
};


/*
========================================
GET ALL WITHDRAWALS (ADMIN)
GET /api/admin/withdrawals
========================================
*/

export const getAllWithdrawals = async (
  req: Request,
  res: Response
) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    /*
    ================================
    FILTER
    ================================
    */

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    /*
    ================================
    FETCH WITHDRAWALS
    ================================
    */

    const withdrawals = await Withdrawal.find(filter)
      .populate("user", "name email city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Withdrawal.countDocuments(filter);

    return res.json({
      withdrawals,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {

    console.error("GET WITHDRAWALS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch withdrawals"
    });

  }
};