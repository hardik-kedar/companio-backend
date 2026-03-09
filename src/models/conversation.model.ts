import mongoose, { Schema, Types, Document }
from "mongoose";


export interface ConversationDocument
extends Document {

  renter: Types.ObjectId;

  companion: Types.ObjectId;

  booking: Types.ObjectId;

  lastMessage?: string;

  lastMessageAt?: Date;

  createdAt: Date;

  updatedAt: Date;

}


const conversationSchema =
new Schema<ConversationDocument>(
{

  renter:
  {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  companion:
  {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  booking:
  {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true
  },

  lastMessage:
  {
    type: String,
    default: ""
  },

  lastMessageAt:
  {
    type: Date,
    default: Date.now
  }

},
{
  timestamps: true
}
);


export default mongoose.model<ConversationDocument>(
  "Conversation",
  conversationSchema
);