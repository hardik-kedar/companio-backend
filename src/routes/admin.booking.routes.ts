import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

import {
  getAllDisputes,
  resolveDispute
} from "../controllers/admin.booking.controller";

import { getAllBookings }
from "../controllers/admin.booking.controller";
import {
  adminCancelBooking
} from "../controllers/admin.booking.controller";


const router = Router();

router.post(
  "/:bookingId/cancel",
  protect,
  adminOnly,
  adminCancelBooking
);



router.get(
  "/",
  protect,
  adminOnly,
  getAllBookings
);


router.get(
  "/disputes",
  protect,
  adminOnly,
  getAllDisputes
);

router.post(
  "/resolve-dispute",
  protect,
  adminOnly,
  resolveDispute
);

export default router;