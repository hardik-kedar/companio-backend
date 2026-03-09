import express from "express";
import { protect } from "../middlewares/auth.middleware";

import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount
} from "../controllers/message.controller";

const router = express.Router();

/*
SEND MESSAGE
POST /api/messages/send
*/
router.post("/send", protect, sendMessage);

/*
GET MESSAGES
GET /api/messages/:conversationId
*/
router.get("/:conversationId", protect, getMessages);

/*
MARK MESSAGES READ
PATCH /api/messages/read/:conversationId
*/
router.patch("/read/:conversationId", protect, markMessagesAsRead);

/*
UNREAD COUNT
GET /api/messages/unread-count
*/
router.get("/unread-count", protect, getUnreadCount);

export default router;