import { Types } from "mongoose";
import { Notification } from
"../models/Notification.model";

export const createNotification =
async (
  userId: Types.ObjectId,
  type: string,
  title: string,
  message: string,
  bookingId?: Types.ObjectId
) => {

  await Notification.create({

    user: userId,

    type,

    title,

    message,

    bookingId: bookingId,

    isRead: false

  });

};