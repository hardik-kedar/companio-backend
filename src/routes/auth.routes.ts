import { Router } from "express";
import { registerPaid, login } from "../controllers/auth.controller";

const router = Router();
router.post("/register-paid", registerPaid);
router.post("/login", login);

export default router;
