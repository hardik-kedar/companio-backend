import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {User} from "../models/User.model";

const router = express.Router();

router.post("/subscribe", protect, async (req, res) => {

  const userId = (req as any).user.userId;
  const subscription = req.body;

  await User.findByIdAndUpdate(
    userId,
    { pushSubscription: subscription }
  );

  res.json({ success: true });

});

export default router;