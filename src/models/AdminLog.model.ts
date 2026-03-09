import mongoose, { Schema } from "mongoose";

const AdminLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: "User" },
  action: String,
  targetUser: { type: Schema.Types.ObjectId, ref: "User" },
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

export const AdminLog = mongoose.model("AdminLog", AdminLogSchema);