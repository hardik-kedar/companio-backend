import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";

dotenv.config();

const app = express();

// 🔐 Security & parsing middleware FIRST
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// 🚀 Routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// 🟢 Health check
app.get("/", (_req, res) => {
  res.send("Companio API running");
});

export default app;
