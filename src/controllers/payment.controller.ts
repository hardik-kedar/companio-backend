import { Request, Response } from "express";
import Razorpay from "razorpay";

/**
 * Lazy Razorpay initialization
 * Prevents crash during module evaluation
 */
const getRazorpayInstance = (): Razorpay => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay ENV ERROR");
    console.error("RAZORPAY_KEY_ID:", keyId);
    console.error("RAZORPAY_KEY_SECRET:", keySecret ? "Loaded" : "Missing");

    throw new Error(
      "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment variables"
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const createOrder = async (req: Request, res: Response) => {
  try {

    const { plan } = req.body;

    let price = 0;
    let days = 0;

    if (plan === "1_month") {
      price = Number(process.env.SUBSCRIPTION_1M_PRICE); // 199
      days = Number(process.env.SUBSCRIPTION_1M_DAYS);   // 30
    }

    else if (plan === "3_month") {
      price = Number(process.env.SUBSCRIPTION_3M_PRICE); // 299
      days = Number(process.env.SUBSCRIPTION_3M_DAYS);   // 90
    }

    else {
      return res.status(400).json({
        message: "Invalid subscription plan"
      });
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: price * 100, // convert ₹ → paise
      currency: "INR",
      receipt: `subscription_${Date.now()}`,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      days
    });

  } catch (error: any) {

    console.error("ORDER CREATION ERROR:", error);

    return res.status(500).json({
      message: "Order creation failed",
      error: process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
    });

  }
};
