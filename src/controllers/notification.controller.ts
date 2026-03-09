import { Request, Response } from "express";
import { Notification } from "../models/Notification.model";


/*
====================================
GET MY NOTIFICATIONS
====================================
*/
export const getMyNotifications = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user.userId;

    const notifications =
      await Notification.find({
        user: userId
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      notifications
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed"
    });

  }

};


/*
====================================
MARK AS READ
====================================
*/

export const markNotificationRead = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    await Notification.findByIdAndUpdate(
      id,
      { isRead: true }
    );

    res.json({ success: true });

  }
  catch {

    res.status(500).json({
      success: false
    });

  }

};

export const getUnreadCount = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const count =
      await Notification.countDocuments({
        user: req.user.userId,
        isRead: false
      });

    res.json({ count });

  }
  catch {

    res.status(500).json({ count: 0 });

  }

};