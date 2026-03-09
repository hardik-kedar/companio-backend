import { Request, Response } from "express";
import Transaction  from "../models/Transaction.model";

/*
========================================
GET USER TRANSACTIONS
GET /api/transactions/me
========================================
*/

export const getMyTransactions = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = (req as any).user.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const transactions =
      await Transaction.find({
        user: userId
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total =
      await Transaction.countDocuments({
        user: userId
      });

    return res.json({

      transactions,

      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }

    });

  } catch (error) {

    console.error("TRANSACTION ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch transactions"
    });

  }

};