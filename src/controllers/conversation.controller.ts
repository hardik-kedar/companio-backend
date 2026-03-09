// import { Request, Response }
// from "express";

// import Conversation
// from "../models/conversation.model";

// import Message from "../models/message.model";

// /*
// ================================
// GET MY CONVERSATIONS
// ================================
// */
// export const getMyConversations =
// async (
//   req: Request & { user?: any },
//   res: Response
// ) => {

//   try {

//     const userId =
//       req.user.userId;

//     /*
//     find conversations where
//     user is renter OR companion
//     */

//     const conversations = await Conversation.find({
//   $or: [
//     { renter: userId },
//     { companion: userId }
//   ]
// })
// .populate("renter", "name")
// .populate("companion", "name")
// .sort({ updatedAt: -1 });

// const results = await Promise.all(
//   conversations.map(async (c) => {

//     const unreadCount =
//       await Message.countDocuments({
//         conversation: c._id,
//         sender: { $ne: userId },
//         isRead: false
//       });

//     return {
//       ...c.toObject(),
//       unreadCount
//     };

//   })
// );

// res.json({ conversations: results });


//     /*
//     format response
//     */

//     const result =
//       conversations.map(
//         (c: any) => {

//           const isRenter =
//             c.renter._id.toString()
//             === userId;

//           const otherUser =
//             isRenter
//             ? c.companion
//             : c.renter;

//           return {

//             _id:
//               c._id,

//             booking:
//               c.booking,

//             otherUser:
//             {
//               _id:
//                 otherUser._id,

//               name:
//                 otherUser.name
//             },

//             lastMessage:
//               c.lastMessage,

//             lastMessageAt:
//               c.lastMessageAt

//           };

//         }
//       );


//     res.json({
//       conversations: result
//     });

//   }
//   catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//       "Failed to fetch conversations"
//     });

//   }

// };


import { Request, Response } from "express";

import Conversation from "../models/conversation.model";
import Message from "../models/message.model";

/*
================================
GET MY CONVERSATIONS
================================
*/

export const getMyConversations = async (
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

    /*
    find conversations where
    user is renter OR companion
    */

    const conversations = await Conversation.find({
      $or: [
        { renter: userId },
        { companion: userId }
      ]
    })
      .populate("renter", "name")
      .populate("companion", "name")
      .sort({ updatedAt: -1 });

    /*
    build response
    */

    const results = await Promise.all(

      conversations.map(async (c: any) => {

        const unreadCount =
          await Message.countDocuments({
            conversation: c._id,
            sender: { $ne: userId },
            isRead: false
          });

        const isRenter =
          c.renter._id.toString() === userId;

        const otherUser =
          isRenter
            ? c.companion
            : c.renter;

        return {

          _id: c._id,

          booking: c.booking,

          otherUser: {
            _id: otherUser._id,
            name: otherUser.name
          },

          lastMessage: c.lastMessage,

          lastMessageAt: c.lastMessageAt,

          unreadCount

        };

      })

    );

    return res.json({
      conversations: results
    });

  }
  catch (error) {

    console.error("getMyConversations error:", error);

    return res.status(500).json({
      message: "Failed to fetch conversations"
    });

  }

};


export const getConversationByBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const { bookingId } = req.params;

    const conversation =
      await Conversation.findOne({
        booking: bookingId
      });

    if (!conversation) {

      return res.status(404).json({
        message: "Conversation not found"
      });

    }

    return res.json({
      conversation
    });

  }
  catch (error) {

    console.error(
      "GET CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch conversation"
    });

  }

};

// export const getConversationById = async (


//   req: Request,
//   res: Response
// ) => {

//   try {

//     const { conversationId } = req.params;

//     const conversation =
//       await Conversation.findById(conversationId)
//       .populate("renter", "name")
//       .populate("companion", "name");

//     if (!conversation) {
//       return res.status(404).json({
//         message: "Conversation not found"
//       });
//     }

//     res.json({ conversation });

//   }
//   catch (error) {

//     console.error("GET CONVERSATION ERROR:", error);

//     res.status(500).json({
//       message: "Failed to load conversation"
//     });

//   }

// };

export const getConversationById = async (
  req: Request,
  res: Response
) => {
  try {

    const { conversationId } = req.params;

    const conversation =
      await Conversation
        .findById(conversationId)
        .populate("renter", "name")
        .populate("companion", "name");

    if (!conversation) {

      return res.status(404).json({
        message: "Conversation not found"
      });

    }

    return res.json({
      conversation
    });

  }
  catch (error) {

    console.error("GET CONVERSATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch conversation"
    });

  }
};