// import cookieParser from "cookie-parser";
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";

// import authRoutes from "./routes/auth.routes";
// import paymentRoutes from "./routes/payment.routes";
// import exploreRoutes from "./routes/explore.routes";
// import bookingRoutes from "./routes/booking.routes";
// import userRoutes from "./routes/user.routes";
// import adminRoutes from "./routes/admin.routes";

// import { errorHandler } from "./middlewares/error.middleware";

// const app = express();

// /*
// ================================
// SECURITY
// ================================
// */

// app.use(
//   helmet({
//     contentSecurityPolicy: false, // 🔥 allow Razorpay checkout
//   })
// );

// /*
// ================================
// CORS
// ================================
// */

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// /*
// ================================
// BODY PARSER
// ================================
// */

// app.use(express.json());
// app.use(cookieParser());

// /*
// ================================
// RATE LIMIT
// ================================
// */

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });

// app.use(limiter);

// /*
// ================================
// ROUTES
// ================================
// */

// app.use("/api/auth", authRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/explore", exploreRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/admin", adminRoutes);

// /*
// ================================
// TEST ROUTES
// ================================
// */

// app.get("/", (_req, res) => {
//   res.send("Companio API running");
// });

// app.get("/test-user-route", (_req, res) => {
//   res.send("User route is mounted");
// });

// /*
// ================================
// ERROR HANDLER
// ================================
// */

// app.use(errorHandler);

// export default app;
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";
import exploreRoutes from "./routes/explore.routes";
import bookingRoutes from "./routes/booking.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";

import { errorHandler } from "./middlewares/error.middleware";

const app = express();

/*
================================
SECURITY
================================
*/

app.use(
  helmet({
    contentSecurityPolicy: false, // allow Razorpay checkout
  })
);

/*
================================
CORS
================================
*/

const allowedOrigins = [
  "http://localhost:3000",
  "https://trycompanio.in",
  "https://www.trycompanio.in",
  "https://companio-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/*
================================
BODY PARSER
================================
*/

app.use(express.json());
app.use(cookieParser());

/*
================================
RATE LIMIT
================================
*/

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

/*
================================
ROUTES
================================
*/

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

/*
================================
TEST ROUTES
================================
*/

app.get("/", (_req, res) => {
  res.send("Companio API running");
});

app.get("/test-user-route", (_req, res) => {
  res.send("User route is mounted");
});

/*
================================
ERROR HANDLER
================================
*/

app.use(errorHandler);

export default app;