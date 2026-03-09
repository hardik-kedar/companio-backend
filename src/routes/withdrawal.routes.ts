import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { requestWithdrawal } from "../controllers/withdrawal.controller";

const router = express.Router();

/*
========================================
REQUEST WITHDRAWAL
POST /api/withdrawals/request
========================================
*/

router.post(
  "/request",
  protect,
  requestWithdrawal
);

export default router;