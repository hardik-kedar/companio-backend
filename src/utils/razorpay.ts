// import Razorpay from "razorpay";

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID as string,
//   key_secret: process.env.RAZORPAY_KEY_SECRET as string
// });
import Razorpay from "razorpay";

/**
 * Validate environment variables early
 * (Fail fast with clear error)
 */
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error(
    "Razorpay keys are missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
  );
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});
