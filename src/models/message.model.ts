// import mongoose, {
//   Schema,
//   Types,
//   Document
// } from "mongoose";


// export interface IMessage
// extends Document {

//   conversation:
//     Types.ObjectId;

//   sender:
//     Types.ObjectId;

//   text:
//     string;

//   isRead:
//     boolean;

//   createdAt:
//     Date;

//   updatedAt:
//     Date;

// }


// const MessageSchema =
// new Schema<IMessage>(
// {
//   conversation:
//   {
//     type:
//       Schema.Types.ObjectId,

//     ref:
//       "Conversation",

//     required:
//       true,

//     index:
//       true
//   },

//   sender:
//   {
//     type:
//       Schema.Types.ObjectId,

//     ref:
//       "User",

//     required:
//       true
//   },

//   text:
//   {
//     type:
//       String,

//     required:
//       true,

//     trim:
//       true,

//     maxlength:
//       2000
//   },

//   /*
//   ============================
//   READ STATUS
//   ============================
//   */

//   isRead:
//   {
//     type:
//       Boolean,

//     default:
//       false,

//     index:
//       true
//   }

// },
// {
//   timestamps:
//     true
// }
// );


// export default mongoose.model<IMessage>(
//   "Message",
//   MessageSchema
// );


import mongoose, { Schema, Types } from "mongoose";

interface Message {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  isRead: boolean;
  readAt?: Date;
}

const messageSchema = new Schema<Message>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "Message",
  messageSchema
);