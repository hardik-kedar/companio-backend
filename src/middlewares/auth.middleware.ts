// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// import { User } from "../models/User.model";

// interface JwtPayload {
//   userId: string;
//   role: string;
// }

// export const protect = async (
//   req: Request & { user?: any },
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as JwtPayload;

//     // 🔥 Always fetch fresh user from DB
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(401).json({ message: "User no longer exists" });
//     }

//     // 🚫 Deleted user
//     if (user.isDeleted) {
//       return res.status(403).json({ message: "Account deleted" });
//     }

//     // 🚫 Banned user
//     if (user.isBanned) {
//       return res.status(403).json({ message: "Account banned" });
//     }

//     // ⏳ Suspended user
//     if (
//       user.isSuspended &&
//       user.suspensionExpiresAt &&
//       user.suspensionExpiresAt > new Date()
//     ) {
//       return res.status(403).json({
//         message: "Account suspended"
//       });
//     }

//     // ✅ Attach safe user object
//     req.user = {
//       userId: user._id,
//       role: user.role,
//       email: user.email
//     };



//     await User.findByIdAndUpdate(decoded.id, {
//   lastSeen: new Date()
// });

//     next();

//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };



import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";


interface JwtPayload {

  userId: string;

  role: string;

}


export const protect =
  async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {

    try {

      const token =
        req.cookies?.token;


      if (!token) {
        return res.status(401).json({
          message: "Not authorized"
        });
      }


      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JwtPayload;


      const user =
        await User.findById(
          decoded.userId
        );


      if (!user) {

        return res.status(401).json({
          message: "User not found"
        });

      }


      /*
      attach user
      */

      req.user = {

        userId:
          user._id.toString(),

        role:
          user.role,

        email:
          user.email

      };


      /*
      update last seen
      */

      await User.findByIdAndUpdate(
        decoded.userId,
        {
          lastSeen: new Date()
        }
      );


      next();

    }
    catch {

      return res.status(401).json({
        message: "Invalid token"
      });

    }

};