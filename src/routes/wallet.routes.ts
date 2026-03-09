// import express from "express";
// import { protect } from "../middlewares/auth.middleware";

// import {
//   getMyWallet,
//   requestWithdrawal
// } from "../controllers/wallet.controller";

// const router = express.Router();

// router.get("/me", protect, getMyWallet);

// router.post(
//   "/withdrawals/request",
//   protect,
//   requestWithdrawal
// );

// export default router;

import express from "express";
import { protect } from "../middlewares/auth.middleware";

import {
  getMyWallet,
  requestWithdrawal
} from "../controllers/wallet.controller";

const router = express.Router();

router.get("/me", protect, getMyWallet);

router.post("/withdraw", protect, requestWithdrawal);

export default router;