
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  updatePrice,
  getMyProfile,
  updateProfile,
  updateProfilePhoto,   // ✅ ADD THIS
  addPost,  
  deletePost,
  getPublicProfile             // ✅ ADD THIS
} from "../controllers/user.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/me", protect, getMyProfile);

router.put("/profile", protect, updateProfile);

router.put("/price", protect, updatePrice);

router.put(
  "/profile-photo",
  protect,
  upload.single("image"),
  updateProfilePhoto
);

router.post(
  "/posts",
  protect,
  upload.single("image"),
  addPost
);

router.delete("/posts/:postId", protect, deletePost);

router.get("/:id", protect, getPublicProfile);

export default router;
