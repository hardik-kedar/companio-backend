import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { User } from "../models/User.model";
import { Withdrawal } from "../models/Withdrawal.model";
import Transaction from "../models/Transaction.model";

/*
========================================
ADMIN FINANCE SUMMARY
GET /api/admin/finance/summary
========================================
*/

export const getFinanceSummary = async (
  req: Request,
  res: Response
) => {
  try {

    /*
    ============================================
    TOTAL PLATFORM REVENUE
    Sum of platformFee from completed bookings
    ============================================
    */

    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["completed", "paid_pending_service"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$platformFee" }
        }
      }
    ]);

    const totalPlatformRevenue =
      revenueAgg[0]?.totalRevenue || 0;


    /*
    ============================================
    TOTAL ESCROW LIABILITY
    Sum of all users wallet.pending
    ============================================
    */

    const escrowAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalEscrow: { $sum: "$wallet.pending" }
        }
      }
    ]);

    const totalEscrowPending =
      escrowAgg[0]?.totalEscrow || 0;


    /*
    ============================================
    TOTAL WALLET BALANCE LIABILITY
    Sum of all users wallet.balance
    ============================================
    */

    const walletAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$wallet.balance" }
        }
      }
    ]);

    const totalWalletBalance =
      walletAgg[0]?.totalBalance || 0;


    /*
    ============================================
    TOTAL WITHDRAWALS PAID
    ============================================
    */

    const withdrawalsPaidAgg =
      await Withdrawal.aggregate([
        {
          $match: {
            status: "paid"
          }
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: "$amount" }
          }
        }
      ]);

    const totalWithdrawalsPaid =
      withdrawalsPaidAgg[0]?.totalPaid || 0;


    /*
    ============================================
    TOTAL PENDING WITHDRAWALS
    ============================================
    */

    const pendingWithdrawalsAgg =
      await Withdrawal.aggregate([
        {
          $match: {
            status: { $in: ["pending", "approved", "processing"] }
          }
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: "$amount" }
          }
        }
      ]);

    const totalPendingWithdrawals =
      pendingWithdrawalsAgg[0]?.totalPending || 0;


    /*
    ============================================
    RETURN SUMMARY
    ============================================
    */

    return res.json({

  summary: {

    totalRevenue: totalPlatformRevenue,

    totalPayouts: totalWithdrawalsPaid,

    totalBookings: await Booking.countDocuments(),

    totalWithdrawals: totalWithdrawalsPaid

  }

});

  } catch (error) {

    console.error("FINANCE SUMMARY ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch finance summary"
    });

  }
};