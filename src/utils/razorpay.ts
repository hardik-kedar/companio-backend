// import Razorpay from "razorpay";

// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID as string,
//   key_secret: process.env.RAZORPAY_KEY_SECRET as string
// });
// import Razorpay from "razorpay";

// /**
//  * Validate environment variables early
//  * (Fail fast with clear error)
//  */
// console.log("Loaded Razorpay Key:", process.env.RAZORPAY_KEY_ID);

// const keyId = process.env.RAZORPAY_KEY_ID;
// const keySecret = process.env.RAZORPAY_KEY_SECRET;

// if (!keyId || !keySecret) {
//   throw new Error(
//     "Razorpay keys are missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
//   );
// }

// export const razorpay = new Razorpay({
//   key_id: keyId,
//   key_secret: keySecret
// });
// import Razorpay from "razorpay";

// const keyId = process.env.RAZORPAY_KEY_ID;
// const keySecret = process.env.RAZORPAY_KEY_SECRET;

// if (!keyId || !keySecret) {
//   console.error("RAZORPAY_KEY_ID:", keyId);
//   console.error("RAZORPAY_KEY_SECRET:", keySecret);
//   throw new Error("Razorpay keys are missing in .env");
// }

// export const razorpay = new Razorpay({
//   key_id: keyId,
//   key_secret: keySecret,
// });
import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys missing in .env");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};