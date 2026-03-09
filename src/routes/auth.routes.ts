// import { Router } from "express";
// import { registerPaid, login } from "../controllers/auth.controller";

// const router = Router();

// // Paid registration (₹150 subscription)
// router.post("/register-paid", registerPaid);

// // Login
// router.post("/login", login);

// export default router;
import { Router } from "express";
import { registerPaid, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register-paid", registerPaid);
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});


export default router;
