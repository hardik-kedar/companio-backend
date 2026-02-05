import { Request, Response } from "express";
import { razorpay } from "../utils/razorpay";

export const createOrder = async (_req: Request, res: Response) => {
  try {
    const price = Number(process.env.SUBSCRIPTION_PRICE);

    if (!price || isNaN(price)) {
      return res.status(500).json({
        message: "Invalid subscription price configuration"
      });
    }

    const amount = price * 100; // convert to paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `companio_sub_${Date.now()}`
    });

    return res.status(200).json(order);
  } catch (error: any) {
    console.error("RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      message: "Failed to create order",
      razorpayError: error?.error?.description || error?.message || "Unknown error"
    });
  }
};
