// import { Router } from "express";
// import { protect } from "../middlewares/auth.middleware";
// import { adminOnly } from "../middlewares/admin.middleware";

// import {
//   getAllDisputes,
//   refundBooking,
//   releasePayout
// } from "../controllers/admin.dispute.controller";

// const router = Router();

// router.get(
//   "/disputes",
//   protect,
//   adminOnly,
//   getAllDisputes
// );

// router.post(
//   "/disputes/:bookingId/refund",
//   protect,
//   adminOnly,
//   refundBooking
// );

// router.post(
//   "/disputes/:bookingId/release",
//   protect,
//   adminOnly,
//   releasePayout
// );

// export default router;
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

import {
  getAllDisputes,
  refundBooking,
  releasePayout
} from "../controllers/admin.dispute.controller";

const router = Router();

/*
GET ALL DISPUTES
/api/admin/disputes
*/
router.get(
  "/",
  protect,
  adminOnly,
  getAllDisputes
);

/*
REFUND RENTER
/api/admin/disputes/:bookingId/refund
*/
router.post(
  "/:bookingId/refund",
  protect,
  adminOnly,
  refundBooking
);

/*
RELEASE PAYMENT
/api/admin/disputes/:bookingId/release
*/
router.post(
  "/:bookingId/release",
  protect,
  adminOnly,
  releasePayout
);

export default router;