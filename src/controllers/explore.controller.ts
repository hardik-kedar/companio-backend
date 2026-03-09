import { Request, Response } from "express";
import { User } from "../models/User.model";

/* =========================================================
   GET USER LIST (Sorted + Paginated + City Filter)
========================================================= */

export const getUserList = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortParam = (req.query.sort as string) || "rating";
    const city = req.query.city as string;

    let sortOption: any = { averageRating: -1, totalRatings: -1 };

    if (sortParam === "price_low") {
      sortOption = { pricePerHour: 1 };
    } else if (sortParam === "price_high") {
      sortOption = { pricePerHour: -1 };
    }

    const query: any = {
      _id: { $ne: userId },
      isDeleted: false,
      isBanned: false,
      isApproved: true,
      "subscription.isActive": true,
      pricePerHour: { $gt: 0 }
    };

    if (city && city !== "All") {
      query.city = city;
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users
    });

  } catch (error) {
    console.error("LIST ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch users"
    });
  }
};

/* =========================================================
   GET EXPLORE LIST (City Based Only)
========================================================= */

// export const getExploreList = async (req: Request, res: Response) => {
//   try {
//     const { city } = req.query;

//     const filter: any = {
//       isDeleted: false,
//       isBanned: false,
//       isApproved: true,
//       "subscription.isActive": true
//     };

//     if (city && city !== "All") {
//       filter.city = city;
//     }

//     const users = await User.find(filter)
//       .select("-password")
//       .sort({ createdAt: -1 });

//     return res.json({ users });

//   } catch (error) {
//     console.error("Explore error:", error);
//     return res.status(500).json({
//       message: "Failed to fetch users"
//     });
//   }
// };




export const getExploreList = async (req: Request, res: Response) => {
  try {
    /* =====================================================
       SAFE PAGINATION
    ===================================================== */

    const city = req.query.city as string | undefined;

    const pageNumber = Math.max(
      parseInt(req.query.page as string) || 1,
      1
    );

    const pageSizeRaw = parseInt(req.query.limit as string) || 9;

    // Hard cap to prevent abuse / heavy queries
    const pageSize = Math.min(pageSizeRaw, 24);

    const skip = (pageNumber - 1) * pageSize;

    /* =====================================================
       PRODUCTION-GRADE FILTER
       Only show COMPLETE companion profiles
    ===================================================== */

    const filter: any = {
      role: "companion",

      isDeleted: { $ne: true },
      isBanned: { $ne: true },
      isApproved: true,

      "subscription.isActive": true,

      pricePerHour: { $gt: 0 },

      profilePhoto: {
        $exists: true,
        $ne: ""
      },

      bio: {
        $exists: true,
        $regex: /.{20,}/
      },

      city: {
        $exists: true,
        $ne: ""
      },

      state: {
        $exists: true,
        $ne: ""
      }
    };

    /* =====================================================
       OPTIONAL CITY FILTER
    ===================================================== */

    if (city && city !== "All") {
      filter.city = city;
    }

    /* =====================================================
       COUNT TOTAL USERS
    ===================================================== */

    const totalUsers = await User.countDocuments(filter);

    /* =====================================================
       FETCH USERS (LEAN FOR PERFORMANCE)
    ===================================================== */

    const users = await User.find(filter)
      .select(
        "name role city state bio profilePhoto pricePerHour averageRating totalRatings createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      users,

      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: pageNumber,
        pageSize
      }
    });

  } catch (error) {
    console.error("EXPLORE LIST ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch explore users"
    });
  }
};