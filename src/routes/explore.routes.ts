
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getUserList,
  getExploreList
} from "../controllers/explore.controller";

const router = Router();

router.get("/list", protect, getExploreList);
router.get("/users", protect, getUserList);

export default router;