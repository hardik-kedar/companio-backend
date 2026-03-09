import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import webpush from "web-push";

import app from "./app";
import { connectDB } from "./config/db";
import { User } from "./models/User.model";

import adminBookingRoutes from "./routes/admin.booking.routes";
import adminDisputeRoutes from "./routes/admin.dispute.routes";
import notificationRoutes from "./routes/notification.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";

import { startBookingAutoCompleteJob } from "./jobs/bookingAutoComplete.job";
import { runPayoutJob } from "./jobs/payout.job";
import { runPaymentExpiry } from "./services/paymentExpiry.service";
import { runBookingExpiry } from "./services/bookingExpiry.service";

import {
  addOnlineUser,
  removeOnlineUser
} from "./socket/onlineUsers";

import { runAutoReleaseEscrow }
from "./jobs/autoReleaseEscrow.job";

import walletRoutes from "./routes/wallet.routes";
import transactionRoutes from "./routes/transaction.routes";
import withdrawalRoutes
from "./routes/withdrawal.routes";
import cors from "cors";


const PORT = process.env.PORT || 5000;

/*
================================
CONNECT DATABASE
================================
*/
connectDB();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
/*
================================
REGISTER ROUTES
================================
*/

app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin/disputes", adminDisputeRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/withdrawals", withdrawalRoutes);



/*
================================
CREATE HTTP SERVER
================================
*/
const server = http.createServer(app);

/*
================================
CREATE SOCKET SERVER
================================
*/
export const io = new Server(server, {
  cors: {
    origin: [
  "http://localhost:3000",
  "https://trycompanio.in",
  "https://www.trycompanio.in",
  "https://companio-frontend.vercel.app"
],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

/*
================================
SOCKET AUTH MIDDLEWARE
================================
*/
io.use((socket: any, next) => {

  try {

    const cookies = cookie.parse(
      socket.handshake.headers.cookie || ""
    );

    const token = cookies.token;

    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    socket.userId = decoded.userId;

    next();

  } catch (error) {

    console.error("Socket auth error:", error);
    next(new Error("Authentication error"));

  }

});

/*
================================
SOCKET CONNECTION
================================
*/
io.on("connection", (socket: any) => {

  console.log("User connected:", socket.userId);

  /*
  ADD ONLINE USER
  */
  addOnlineUser(socket.userId, socket.id);

  socket.broadcast.emit("user_online", {
    userId: socket.userId
  });

  /*
  JOIN CONVERSATION
  */
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
  });

  /*
  USER TYPING
  */
  socket.on(
    "typing",
    (data: { conversationId: string }) => {

      socket.to(data.conversationId).emit("user_typing", {
        conversationId: data.conversationId,
        userId: socket.userId
      });

    }
  );

  /*
  STOP TYPING
  */
  socket.on(
    "stop_typing",
    (data: { conversationId: string }) => {

      socket.to(data.conversationId).emit("user_stop_typing", {
        conversationId: data.conversationId,
        userId: socket.userId
      });

    }
  );

  /*
  DISCONNECT
  */
  socket.on("disconnect", async () => {

    console.log("User disconnected:", socket.userId);

    removeOnlineUser(socket.userId);

    try {

      await User.findByIdAndUpdate(
        socket.userId,
        { lastSeen: new Date() }
      );

    } catch (err) {

      console.error("LastSeen update failed:", err);

    }

    socket.broadcast.emit("user_offline", {
      userId: socket.userId,
      lastSeen: new Date()
    });

  });

});

/*
================================
WEB PUSH CONFIG
================================
*/
webpush.setVapidDetails(
  "mailto:admin@companio.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/*
================================
START SERVER
================================
*/
server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

  startBookingAutoCompleteJob();

  setInterval(runAutoReleaseEscrow, 60 * 1000);
  setInterval(runPaymentExpiry, 60 * 1000);
  setInterval(runBookingExpiry, 60 * 1000);
  setInterval(runPayoutJob, 60 * 1000);

});