import { Request, Response } from "express";
import { Types } from "mongoose";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import {Booking} from "../models/Booking.model";
import {User} from "../models/User.model";
import { io } from "../server";
import webpush from "web-push";



export const sendMessage = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user?.userId;
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {

      return res.status(400).json({
        message: "conversationId and text required"
      });

    }

    if (!Types.ObjectId.isValid(conversationId)) {

      return res.status(400).json({
        message: "Invalid conversationId"
      });

    }

    /*
    =====================================
    CHECK CONVERSATION
    =====================================
    */

    const conversation =
      await Conversation.findById(conversationId);

    if (!conversation) {

      return res.status(404).json({
        message: "Conversation not found"
      });

    }

    /*
    =====================================
    CHECK USER PARTICIPATION
    =====================================
    */

    const isParticipant =
      conversation.renter.toString() === userId ||
      conversation.companion.toString() === userId;

    if (!isParticipant) {

      return res.status(403).json({
        message: "Not authorized"
      });

    }

    /*
    =====================================
    CHECK BOOKING STATUS
    =====================================
    */

    const booking =
      await Booking.findById(conversation.booking);

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }

    const allowedStatuses = [
      "paid_pending_service",
      "completed",
      "under_review"
    ];

    if (!allowedStatuses.includes(booking.status)) {

      return res.status(403).json({
        message: "Chat not allowed at this stage"
      });

    }

    /*
    =====================================
    CREATE MESSAGE
    =====================================
    */

    const messageDoc =
      await Message.create({
        conversation: conversationId,
        sender: userId,
        text
      });

    const message =
      await Message.findById(messageDoc._id);

    /*
    =====================================
    UPDATE CONVERSATION LAST MESSAGE
    =====================================
    */

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    /*
    =====================================
    DETERMINE RECIPIENT
    =====================================
    */

    const recipientId =
      conversation.renter.toString() === userId
        ? conversation.companion
        : conversation.renter;

    const recipient =
      await User.findById(recipientId);

    /*
    =====================================
    PUSH NOTIFICATION
    =====================================
    */

    if (recipient?.pushSubscription) {

      try {

        await webpush.sendNotification(
          recipient.pushSubscription,
          JSON.stringify({
            title: "New Message",
            body: text,
            url: `/messages/${conversationId}`
          })
        );

      }
      catch (err) {

        console.error("Push failed:", err);

      }

    }

    /*
    =====================================
    REALTIME SOCKET
    =====================================
    */

    io.to(conversationId).emit(
      "receive_message",
      message
    );

    return res.json({ message });

  }
  catch (error) {

    console.error("SEND MESSAGE ERROR:", error);

    return res.status(500).json({
      message: "Failed to send message"
    });

  }

};

/*
================================
SEND MESSAGE
POST /api/messages/send
================================
*/

// export const sendMessage = async (
//   req: Request,
//   res: Response
// ) => {
//   try {

//     const userId = (req as any).user.userId;
//     const { conversationId, text } = req.body;

//     if (!conversationId || !text) {
//       return res.status(400).json({
//         message: "conversationId and text required"
//       });
//     }

//     if (!Types.ObjectId.isValid(conversationId)) {
//       return res.status(400).json({
//         message: "Invalid conversationId"
//       });
//     }

//     /*
//     ============================
//     CHECK CONVERSATION
//     ============================
//     */
//     const conversation =
//       await Conversation.findById(conversationId);

//     if (!conversation) {
//       return res.status(404).json({
//         message: "Conversation not found"
//       });
//     }

//     /*
//     ============================
//     CHECK USER PARTICIPATION
//     ============================
//     */
//     const isParticipant =
//       conversation.renter.toString() === userId ||
//       conversation.companion.toString() === userId;

//     if (!isParticipant) {
//       return res.status(403).json({
//         message: "Not authorized"
//       });
//     }

//     /*
//     ============================
//     CHECK BOOKING STATUS
//     ============================
//     */
//     const booking =
//       await Booking.findById(conversation.booking);

//     if (!booking) {
//       return res.status(404).json({
//         message: "Booking not found"
//       });
//     }

//     const allowedStatuses = ["paid", "active"];

//     if (!allowedStatuses.includes(booking.status)) {
//       return res.status(403).json({
//         message: "Chat not allowed at this stage"
//       });
//     }

//     /*
//     ============================
//     CREATE MESSAGE
//     ============================
//     */
//     const message =
//       await Message.create({
//         conversation: conversationId,
//         sender: userId,
//         text
//       });

//     conversation.lastMessage = text;
//     await conversation.save();

//     /*
//     ============================
//     DETERMINE RECIPIENT
//     ============================
//     */
//     const recipientId =
//       conversation.renter.toString() === userId
//         ? conversation.companion
//         : conversation.renter;

//     const recipient =
//       await User.findById(recipientId);

//     /*
//     ============================
//     PUSH NOTIFICATION (IF OFFLINE)
//     ============================
//     */
//     if (recipient?.pushSubscription) {
//       try {
//         await webpush.sendNotification(
//           recipient.pushSubscription,
//           JSON.stringify({
//             title: "New Message",
//             body: text,
//             url: `/messages/${conversationId}`
//           })
//         );
//       } catch (err) {
//         console.error("Push failed:", err);
//       }
//     }

//     /*
//     ============================
//     EMIT REALTIME
//     ============================
//     */
//     io.to(conversationId).emit(
//       "new_message",
//       message
//     );

//     return res.json({ message });

//   } catch (error) {

//     console.error("SEND MESSAGE ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to send message"
//     });

//   }
// };
/*



================================
GET MESSAGES
GET /api/messages/:conversationId
================================
*/
// export const getMessages = async (
//   req: Request & { user?: any },
//   res: Response
// ) => {

//   try {

//     const userId = req.user?.userId;
//     const conversationId = req.params.conversationId;

//     /*
//     validate id
//     */
//     if (!Types.ObjectId.isValid(conversationId)) {
//       return res.status(400).json({
//         message: "Invalid conversationId"
//       });
//     }

//     /*
//     check conversation exists
//     */
//     const conversation =
//       await Conversation.findById(conversationId);

//     if (!conversation) {
//       return res.status(404).json({
//         message: "Conversation not found"
//       });
//     }

//     /*
//     security check
//     */
//     const isParticipant =
//       conversation.renter.toString() === userId ||
//       conversation.companion.toString() === userId;

//     if (!isParticipant) {
//       return res.status(403).json({
//         message: "Not authorized"
//       });
//     }

//     /*
//     CHECK BOOKING STATUS
//     */
//     const booking =
//       await Booking.findById(
//         conversation.booking.toString()
//       );

//     if (!booking) {
//       return res.status(404).json({
//         message: "Booking not found"
//       });
//     }

//     const allowedStatuses = ["paid", "active"];

//     if (!allowedStatuses.includes(booking.status)) {
//       return res.status(403).json({
//         message: "Chat not available"
//       });
//     }

//     /*
//     fetch messages
//     */
//     const messages =
//       await Message.find({
//         conversation: conversationId
//       }).sort({ createdAt: 1 });

//     return res.json({ messages });

//   }
//   catch (error) {

//     console.error("GET MESSAGES ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to load messages"
//     });

//   }

// };

export const getMessages = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user?.userId;
    const conversationId = req.params.conversationId;

    /*
    ===============================
    VALIDATE CONVERSATION ID
    ===============================
    */

    if (!Types.ObjectId.isValid(conversationId)) {

      return res.status(400).json({
        message: "Invalid conversationId"
      });

    }


    /*
    ===============================
    FIND CONVERSATION
    ===============================
    */

    const conversation =
      await Conversation.findById(conversationId);

    if (!conversation) {

      return res.status(404).json({
        message: "Conversation not found"
      });

    }


    /*
    ===============================
    SECURITY CHECK
    ===============================
    */

    const isParticipant =
      conversation.renter.toString() === userId ||
      conversation.companion.toString() === userId;

    if (!isParticipant) {

      return res.status(403).json({
        message: "Not authorized"
      });

    }


    /*
    ===============================
    CHECK BOOKING STATUS
    ===============================
    */

    const booking =
      await Booking.findById(
        conversation.booking
      );

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }


    const allowedStatuses = [

      "paid_pending_service",

      "completed",

      "under_review"

    ];


    if (!allowedStatuses.includes(booking.status)) {

      return res.status(403).json({
        message: "Chat not available for this booking"
      });

    }


    /*
    ===============================
    FETCH MESSAGES
    ===============================
    */

    const messages =
      await Message.find({
        conversation: conversationId
      })
      .sort({ createdAt: 1 });


    return res.json({

      messages

    });

  }
  catch (error) {

    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to load messages"
    });

  }

};


export const markMessagesRead =
async (req: Request, res: Response) => {

  try {

    const userId =
      (req as any).user.userId;

    const { conversationId } =
      req.params;

    await Message.updateMany(
      {
        conversation:
          conversationId,

        sender:
          { $ne: userId },

        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true
    });

  }
  catch {

    res.status(500).json({
      message: "Failed"
    });

  }

};


// export const getUnreadCount =
// async (req: Request, res: Response) => {

//   try {

//     const userId =
//       (req as any).user.userId;

//     const conversations =
//       await Conversation.find({

//         $or: [
//           { renter: userId },
//           { companion: userId }
//         ]

//       });

//     const ids =
//       conversations.map(
//         c => c._id
//       );

//     const count =
//       await Message.countDocuments({

//         conversation:
//           { $in: ids },

//         sender:
//           { $ne: userId },

//         isRead: false

//       });

//     res.json({ count });

//   }
//   catch {

//     res.status(500).json({
//       count: 0
//     });

//   }

// };

export const getUnreadCount = async (
  req: Request & { user?: any },
  res: Response
) => {

  try {

    const userId = req.user?.userId;

    const conversations =
      await Conversation.find({
        $or: [
          { renter: userId },
          { companion: userId }
        ]
      }).select("_id");

    const conversationIds =
      conversations.map(c => c._id);

    const count =
      await Message.countDocuments({

        conversation: { $in: conversationIds },

        sender: { $ne: userId },

        isRead: false

      });

    res.json({ count });

  }
  catch (error) {

    console.error(
      "GET UNREAD COUNT ERROR:",
      error
    );

    res.status(500).json({
      count: 0
    });

  }

};


export const markMessagesAsRead = async (
  req: Request,
  res: Response
) => {
  try {

    const userId = (req as any).user.userId;
    const { conversationId } = req.params;

    /*
    ============================
    VALIDATION
    ============================
    */

    if (!conversationId || !Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    /*
    ============================
    CHECK USER BELONGS TO CONVERSATION
    ============================
    */

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant =
      conversation.renter.toString() === userId ||
      conversation.companion.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    /*
    ============================
    MARK AS READ
    ============================
    */

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    /*
    ============================
    EMIT REALTIME READ EVENT
    ============================
    */

    io.to(conversationId).emit("messages_read", {
      conversationId
    });

    return res.json({
      success: true
    });

  } catch (error) {

    console.error("MARK READ ERROR:", error);

    return res.status(500).json({
      message: "Failed to mark messages as read"
    });

  }
};