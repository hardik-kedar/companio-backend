import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Booking } from "../models/Booking.model";

export const calculateProfileCompletion = (user: any) => {
  let score = 0;

  if (user.profilePhoto) score += 25;
  if (user.bio && user.bio.length >= 20) score += 25;
  if (user.city) score += 25;
  if (user.state) score += 25;

  // Only companions need price
  if (user.role === "companion") {
    if (user.pricePerHour > 0) score += 20;
    else score -= 20;
  }

  return Math.max(0, Math.min(score, 100));
};



export const updatePrice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { pricePerHour } = req.body;

    if (!pricePerHour || pricePerHour <= 0) {
      return res.status(400).json({
        message: "Valid price required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "companion") {
      return res.status(403).json({
        message: "Only companions can set price"
      });
    }

    user.pricePerHour = pricePerHour;
    await user.save();

    res.json({ message: "Price updated successfully" });

  } catch (error) {
    console.error("UPDATE PRICE ERROR:", error);
    res.status(500).json({ message: "Failed to update price" });
  }
};



// export const getMyProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.userId;

//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     /* =========================
//        PROFILE COMPLETION SCORE
//     ========================= */

//     let score = 0;

//     if (user.profilePhoto) score += 20;

//     if (user.bio && user.bio.length >= 20) score += 20;

//     if (user.role === "companion" && user.pricePerHour > 0)
//       score += 20;

//     if (user.city) score += 20;

//     if (user.state) score += 20;

//     return res.json({
//       ...user.toObject(),
//       profileCompletion: score
//     });

//   } catch (error) {
//     console.error("PROFILE ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to fetch profile"
//     });
//   }
// };

export const getMyProfile = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const user = await User
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
    =========================
    PROFILE COMPLETION SCORE
    =========================
    */

    let score = 0;

    if (user.profilePhoto) score += 20;

    if (user.bio && user.bio.length >= 20)
      score += 20;

    if (
      user.role === "companion" &&
      user.pricePerHour > 0
    ) {
      score += 20;
    }

    if (user.city) score += 20;

    if (user.state) score += 20;

    return res.json({
      ...user.toObject(),
      profileCompletion: score
    });

  }
  catch (error) {

    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch profile"
    });

  }

};



/* =========================================
   UPDATE PROFILE
========================================= */

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { name, bio, pricePerHour, isVisible } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // Only companions can update price
    if (pricePerHour !== undefined) {
      const user = await User.findById(userId);
      if (user?.role !== "companion") {
        return res.status(403).json({
          message: "Only companions can update price"
        });
      }
      updateData.pricePerHour = pricePerHour;
    }

    // Location visibility toggle
    if (isVisible !== undefined) {
      updateData["location.isVisible"] = Boolean(isVisible);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

import { v2 as cloudinary } from "cloudinary";

export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const imageUrl = (req.file as any)?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Delete old profile photo if exists
    if (user.profilePhoto) {
      const publicId = user.profilePhoto
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Old image deletion failed:", err);
      }
    }

    // Save new image
    user.profilePhoto = imageUrl;
    await user.save();

    // 🔒 Remove password before sending response
    const userObj = user.toObject() as any;
    delete userObj.password;
    return res.json({
      message: "Profile photo updated",
      user: userObj
    });

  } catch (error: any) {
    console.error("PROFILE PHOTO ERROR:", error);

    return res.status(500).json({
      message: "Upload failed",
      error: error?.message || "Internal server error"
    });
  }
};


export const addPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image required" });
    }

    (user.posts as any).push({
  imageUrl,
  createdAt: new Date()
});

    await user.save();

    return res.json({
      message: "Post added",
      posts: user.posts
    });

  } catch (error) {
    console.error("ADD POST ERROR:", error);
    return res.status(500).json({ message: "Failed to add post" });
  }
};


export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { postId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = (user.posts as any).id(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔥 Delete image from Cloudinary
    const imageUrl = post.imageUrl;

    const publicId = imageUrl.split("/").pop()?.split(".")[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`companio_profiles/${publicId}`);
    }

    // 🔥 Remove post from array
    post.deleteOne();

    await user.save();

    return res.json({
      message: "Post deleted successfully",
      posts: user.posts,
    });

  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return res.status(500).json({
      message: "Failed to delete post",
    });
  }
};

export const getPublicProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get user without password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Count bookings (as renter OR companion)
    const bookingCount = await Booking.countDocuments({
      $or: [
        { renter: id },
        { companion: id }
      ]
    });

    // 3️⃣ Send user + booking count
    res.json({
      ...user.toObject(),
      bookingCount
    });

  } catch (error) {
    console.error("PUBLIC PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};