import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Booking } from "../models/Booking.model";
import { Rating } from "../models/Rating.model";
import { AdminLog } from "../models/AdminLog.model";

/* =====================================================
   DASHBOARD STATS
===================================================== */

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    const [
      totalUsers,
      totalCompanions,
      totalRenters,
      activeSubscriptions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "companion" }),
      User.countDocuments({ role: "renter" }),
      User.countDocuments({ "subscription.isActive": true })
    ]);

    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      paidBookings
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ status: "paid" })
    ]);

    const revenueStats = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["paid", "completed"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalPlatformEarnings: { $sum: "$platformFee" },
          totalCompanionPayout: { $sum: "$companionEarning" }
        }
      }
    ]);

    const revenueData = revenueStats[0] || {
      totalRevenue: 0,
      totalPlatformEarnings: 0,
      totalCompanionPayout: 0
    };

    return res.json({
      totalUsers,
      totalCompanions,
      totalRenters,
      activeSubscriptions,
      totalBookings,
      pendingBookings,
      paidBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: revenueData.totalRevenue,
      totalPlatformEarnings: revenueData.totalPlatformEarnings,
      totalCompanionPayout: revenueData.totalCompanionPayout
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard data"
    });
  }
};

/* =====================================================
   BAN USER
===================================================== */

export const banUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if ((req as any).user.userId.toString() === userId) {
    return res.status(400).json({
      message: "You cannot ban yourself"
    });
  }

  await User.findByIdAndUpdate(userId, {
    isBanned: true
  });

  res.json({ message: "User banned" });
};

/* =====================================================
   SUSPEND USER
===================================================== */

export const suspendUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const days = Number(req.body.days || 7);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await User.findByIdAndUpdate(userId, {
    isSuspended: true,
    suspensionExpiresAt: expiresAt
  });

  res.json({ message: "User suspended" });
};

/* =====================================================
   DELETE USER
===================================================== */

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndDelete(userId);

    return res.json({ message: "User deleted" });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

/* =====================================================
   FORCE CANCEL BOOKING
===================================================== */

export const forceCancelBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const { bookingId } = req.params;

    await Booking.findByIdAndUpdate(bookingId, {
      status: "cancelled",
      cancelledByAdmin: true
    });

    return res.json({ message: "Booking cancelled by admin" });

  } catch (error) {
    console.error("FORCE CANCEL ERROR:", error);
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
};

/* =====================================================
   DELETE RATING (SOFT DELETE)
===================================================== */

export const deleteRating = async (
  req: Request,
  res: Response
) => {
  try {
    const { ratingId } = req.params;

    await Rating.findByIdAndUpdate(ratingId, {
      isDeleted: true
    });

    return res.json({ message: "Rating deleted" });

  } catch (error) {
    console.error("DELETE RATING ERROR:", error);
    return res.status(500).json({ message: "Failed to delete rating" });
  }
};

/* =====================================================
   DELETE POST
===================================================== */

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.params;

    await User.updateOne(
      { _id: userId },
      { $pull: { posts: { _id: postId } } }
    );

    return res.json({ message: "Post deleted" });

  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

/* =====================================================
   APPROVE COMPANION
===================================================== */

export const approveCompanion = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(userId, {
      isApproved: true
    });

    return res.json({ message: "Companion approved" });

  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return res.status(500).json({ message: "Failed to approve companion" });
  }
};

/* =====================================================
   GET FLAGGED POSTS
===================================================== */

export const getFlaggedPosts = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find({
      "posts.isFlagged": true
    });

    return res.json(users);

  } catch (error) {
    console.error("FLAGGED POSTS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch flagged posts" });
  }
};

/* =====================================================
   GET ADMIN LOGS
===================================================== */

export const getAdminLogs = async (
  req: Request,
  res: Response
) => {
  try {

    const logs = await AdminLog.find()
      .populate("admin targetUser")
      .sort({ createdAt: -1 });

    return res.json({
      logs
    });

  } catch (error) {

    console.error("ADMIN LOG ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch logs"
    });

  }
};


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      User.countDocuments(searchQuery),
    ]);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if ((req as any).user.userId.toString() === userId) {
    return res.status(400).json({
      message: "You cannot unban yourself"
    });
  }

  await User.findByIdAndUpdate(userId, {
    isBanned: false
  });

  res.json({ message: "User unbanned successfully" });
};
