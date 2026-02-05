import { Request, Response } from "express";
import * as bcrypt from "bcrypt";          // ✅ FIXED
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.model";

/**
 * PAID REGISTRATION CONTROLLER
 * User is created ONLY after successful Razorpay payment verification
 */
export const registerPaid = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      acceptedTerms,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 1️⃣ Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !acceptedTerms ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ message: "Terms must be accepted" });
    }

    if (role !== "renter" && role !== "companion") {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2️⃣ Verify Razorpay payment signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 3️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Calculate subscription expiry
    const subscriptionDays = Number(process.env.SUBSCRIPTION_DAYS) || 14;
    const expiresAt = new Date(
      Date.now() + subscriptionDays * 24 * 60 * 60 * 1000
    );

    // 6️⃣ Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      acceptedTerms,
      subscription: {
        isActive: true,
        expiresAt
      }
    });

    return res.status(201).json({
      message: "Registration successful. Subscription activated."
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * LOGIN CONTROLLER
 * Allows login ONLY if subscription is active
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Subscription validation
    if (
      !user.subscription.isActive ||
      !user.subscription.expiresAt ||
      user.subscription.expiresAt < new Date()
    ) {
      return res.status(403).json({
        message: "Subscription expired. Please renew."
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};
