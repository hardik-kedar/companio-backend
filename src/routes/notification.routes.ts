import express from "express";

import {
  getMyNotifications,
  markNotificationRead,
  getUnreadCount
}
from "../controllers/notification.controller";

import { protect }
from "../middlewares/auth.middleware";

const router = express.Router();


/*
GET all notifications
*/
router.get(
  "/",
  protect,
  getMyNotifications
);


/*
GET unread count (for bell badge)
*/
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);


/*
MARK notification as read
*/
router.patch(
  "/read/:id",
  protect,
  markNotificationRead
);


export default router;