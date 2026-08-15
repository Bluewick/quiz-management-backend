import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
