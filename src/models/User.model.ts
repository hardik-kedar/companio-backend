import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "renter" | "companion";
  acceptedTerms: boolean;
  subscription: {
    isActive: boolean;
    expiresAt: Date | null;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ["renter", "companion"], required: true },
  acceptedTerms: { type: Boolean, required: true },
  subscription: {
    isActive: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>("User", UserSchema);
