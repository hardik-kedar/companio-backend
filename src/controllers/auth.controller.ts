// import { Request, Response } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import { User } from "../models/User.model";

// /* =========================================================
//    PAID REGISTRATION
// ========================================================= */

// export const registerPaid = async (req: Request, res: Response) => {
//   console.log("Register paid called");

//   try {
//     const {
//       name,
//       email,
//       password,
//       role,
//       acceptedTerms,
//       state,
//       city,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     /* ============================
//        BASIC VALIDATION
//     ============================ */

//     if (
//       !name ||
//       !email ||
//       !password ||
//       !role ||
//       acceptedTerms !== true ||
//       !state ||
//       !city ||
//       !razorpay_order_id ||
//       !razorpay_payment_id
//     ) {
//       return res.status(400).json({
//         message: "Missing required fields"
//       });
//     }

//     /* ============================
//        PAYMENT VERIFICATION
//     ============================ */

//     if (process.env.NODE_ENV === "production") {
//       const body = `${razorpay_order_id}|${razorpay_payment_id}`;

//       const expectedSignature = crypto
//         .createHmac(
//           "sha256",
//           process.env.RAZORPAY_KEY_SECRET as string
//         )
//         .update(body)
//         .digest("hex");

//       if (expectedSignature !== razorpay_signature) {
//         return res.status(400).json({
//           message: "Payment verification failed"
//         });
//       }
//     }

//     /* ============================
//        CHECK EXISTING USER
//     ============================ */

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists"
//       });
//     }

//     /* ============================
//        HASH PASSWORD
//     ============================ */

//     const hashedPassword = await bcrypt.hash(password, 10);

//     /* ============================
//        SUBSCRIPTION EXPIRY
//     ============================ */

//     const expiresAt = new Date(
//       Date.now() +
//         Number(process.env.SUBSCRIPTION_DAYS) *
//           24 *
//           60 *
//           60 *
//           1000
//     );

//     /* ============================
//        CREATE USER
//     ============================ */

//     await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       acceptedTerms,
//       state,
//       city,
//       subscription: {
//         isActive: true,
//         expiresAt
//       },
//       location: {
//         isVisible: false,
//         coordinates: {
//           type: "Point",
//           coordinates: [0, 0] // safe default
//         }
//       }
//     });

//     return res.status(201).json({
//       message: "Registration successful"
//     });

//   } catch (error) {
//     console.error("REGISTER ERROR:", error);

//     return res.status(500).json({
//       message: "Registration failed",
//       error:
//         error instanceof Error
//           ? error.message
//           : "Unknown error"
//     });
//   }
// };

// /* =========================================================
//    LOGIN
// ========================================================= */


// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "7d" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: false,
//     });

//     return res.json({
//       message: "Login successful",
//       role: user.role
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const logout = (req: Request, res: Response) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//     path: "/",
//   });

//   return res.json({ message: "Logged out successfully" });
// };

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.model";


/* =========================================================
REGISTER PAID
========================================================= */

export const registerPaid = async (
  req: Request,
  res: Response
) => {

console.log("REGISTER BODY:", req.body);


  try {

    console.log("REGISTER BODY:", req.body);

    const {
      name,
      email,
      password,
      role,
      acceptedTerms,
      state,
      city,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
  !name ||
  !email ||
  !password ||
  !role ||
  !state ||
  !city ||
  !razorpay_payment_id ||
  !acceptedTerms
) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    if (process.env.NODE_ENV === "production") {

      const body =
        razorpay_order_id +
        "|" +
        razorpay_payment_id;

      const expected =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET!
          )
          .update(body)
          .digest("hex");

      if (expected !== razorpay_signature) {
        return res.status(400).json({
          message: "Payment verification failed"
        });
      }

    }

    const existing =
      await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashed =
      await bcrypt.hash(password, 10);

    const expiresAt =
      new Date(
        Date.now() +
        Number(process.env.SUBSCRIPTION_DAYS || 30) *
        86400000
      );

    await User.create({
      name,
      email,
      password: hashed,
      role,
      acceptedTerms,
      state,
      city,
      subscription: {
        isActive: true,
        expiresAt
      }
    });

    return res.status(201).json({
      message: "Registration successful"
    });

  }
  catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Registration failed"
    });

  }
};


/* =========================================================
LOGIN
========================================================= */

export const login = async (
  req: Request,
  res: Response
) => {

  try {

    const { email, password } = req.body;


    const user =
      await User
        .findOne({ email })
        .select("+password");


    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }


    const match =
      await bcrypt.compare(
        password,
        user.password
      );

      console.log("Password entered:", password);
console.log("Password in DB:", user.password);
console.log("Match result:", match);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }


    /*
    FIX: include role
    */

    const token =
      jwt.sign(

        {
          userId: user._id,
          role: user.role
        },

        process.env.JWT_SECRET!,

        {
          expiresIn: "7d"
        }

      );


    res.cookie(
      "token",
      token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }
    );


    return res.json({

      message: "Login successful",

      role: user.role

    });

  }
  catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Login failed"
    });

  }

};



/* =========================================================
LOGOUT
========================================================= */

export const logout =
  (req: Request, res: Response) => {

    res.clearCookie("token");

    res.json({
      message: "Logged out"
    });

};