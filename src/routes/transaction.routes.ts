import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { getMyTransactions } from "../controllers/transaction.controller";

const router = express.Router();

router.get(
  "/me",
  protect,
  getMyTransactions
);

export default router;