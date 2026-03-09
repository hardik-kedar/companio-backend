// import { Router } from "express";

// /*
// ========================================
// MIDDLEWARE
// ========================================
// */

// import { protect } from "../middlewares/auth.middleware";
// import { adminOnly } from "../middlewares/admin.middleware";

// /*
// ========================================
// ADMIN CONTROLLERS
// ========================================
// */

// import {
//   deletePost,
//   approveCompanion,
//   getFlaggedPosts,
//   getAdminLogs,
//   deleteRating
// } from "../controllers/admin.controller";

// import { getFinanceSummary } 
// from "../controllers/admin.finance.controller";

// import { getAllWithdrawals } 
// from "../controllers/admin.withdrawal.controller";

// import {
//   getAllUsers,
//   banUser,
//   unbanUser,
//   suspendUser,
//   deleteUser
// } from "../controllers/admin.controller";

// /*
// ========================================
// ROUTER INIT
// ========================================
// */

// const router = Router();

// /*
// ========================================
// FINANCE SUMMARY
// GET /api/admin/finance/summary
// ========================================
// */



// router.get(
//   "/withdrawals",
//   protect,
//   adminOnly,
//   getAllWithdrawals
// );

// router.get(
//   "/finance/summary",
//   protect,
//   adminOnly,
//   getFinanceSummary
// );

// /*
// ========================================
// OTHER ADMIN ROUTES
// ========================================
// */

// router.post(
//   "/approve-companion/:userId",
//   protect,
//   adminOnly,
//   approveCompanion
// );

// router.get(
//   "/flagged-posts",
//   protect,
//   adminOnly,
//   getFlaggedPosts
// );

// router.delete(
//   "/delete-post/:postId",
//   protect,
//   adminOnly,
//   deletePost
// );

// router.delete(
//   "/delete-rating/:ratingId",
//   protect,
//   adminOnly,
//   deleteRating
// );

// router.get(
//   "/logs",
//   protect,
//   adminOnly,
//   getAdminLogs
// );


// /*
// ========================================
// USER MANAGEMENT
// ========================================
// */

// router.get(
//   "/users",
//   protect,
//   adminOnly,
//   getAllUsers
// );

// router.post(
//   "/ban/:id",
//   protect,
//   adminOnly,
//   banUser
// );

// router.post(
//   "/unban/:id",
//   protect,
//   adminOnly,
//   unbanUser
// );

// router.post(
//   "/suspend/:id",
//   protect,
//   adminOnly,
//   suspendUser
// );

// router.delete(
//   "/user/:id",
//   protect,
//   adminOnly,
//   deleteUser
// );
// export default router;


import { Router } from "express";

/*
========================================
MIDDLEWARE
========================================
*/

import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

/*
========================================
ADMIN CONTROLLERS
========================================
*/

import {
  deletePost,
  approveCompanion,
  getFlaggedPosts,
  getAdminLogs,
  deleteRating,
  getAllUsers,
  banUser,
  unbanUser,
  suspendUser,
  deleteUser
} from "../controllers/admin.controller";

import { getFinanceSummary }
from "../controllers/admin.finance.controller";

import {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from "../controllers/admin.withdrawal.controller";

/*
========================================
ROUTER INIT
========================================
*/

const router = Router();

/*
========================================
WITHDRAWALS
GET /api/admin/withdrawals
========================================
*/

router.get(
  "/withdrawals",
  protect,
  adminOnly,
  getAllWithdrawals
);

/*
========================================
APPROVE WITHDRAWAL
POST /api/admin/withdrawals/:id/approve
========================================
*/

router.post(
  "/withdrawals/:id/approve",
  protect,
  adminOnly,
  approveWithdrawal
);

/*
========================================
REJECT WITHDRAWAL
POST /api/admin/withdrawals/:id/reject
========================================
*/

router.post(
  "/withdrawals/:id/reject",
  protect,
  adminOnly,
  rejectWithdrawal
);

/*
========================================
FINANCE SUMMARY
GET /api/admin/finance/summary
========================================
*/

router.get(
  "/finance/summary",
  protect,
  adminOnly,
  getFinanceSummary
);

/*
========================================
COMPANION APPROVAL
========================================
*/

router.post(
  "/approve-companion/:userId",
  protect,
  adminOnly,
  approveCompanion
);

/*
========================================
CONTENT MODERATION
========================================
*/

router.get(
  "/flagged-posts",
  protect,
  adminOnly,
  getFlaggedPosts
);

router.delete(
  "/delete-post/:postId",
  protect,
  adminOnly,
  deletePost
);

router.delete(
  "/delete-rating/:ratingId",
  protect,
  adminOnly,
  deleteRating
);

/*
========================================
ADMIN LOGS
========================================
*/

router.get(
  "/logs",
  protect,
  adminOnly,
  getAdminLogs
);

/*
========================================
USER MANAGEMENT
========================================
*/

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.post(
  "/ban/:id",
  protect,
  adminOnly,
  banUser
);

router.post(
  "/unban/:id",
  protect,
  adminOnly,
  unbanUser
);

router.post(
  "/suspend/:id",
  protect,
  adminOnly,
  suspendUser
);

router.delete(
  "/user/:id",
  protect,
  adminOnly,
  deleteUser
);

export default router;