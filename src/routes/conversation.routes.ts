import express from "express";

import {
  getMyConversations,
  getConversationByBooking,
  getConversationById
}
from "../controllers/conversation.controller";

import { protect }
from "../middlewares/auth.middleware";


const router =
express.Router();


router.get(
  "/",
  protect,
  getMyConversations
);

router.get(
  "/booking/:bookingId",
  protect,
  getConversationByBooking
);
router.get(
  "/:conversationId",
  protect,
  getConversationById
);

export default router;