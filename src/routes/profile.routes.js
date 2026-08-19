import express from "express";
import { z } from "zod";
import { getProfile, updateProfile, changePassword } from "../controllers/profile.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters long").max(255).optional(),
    phone_number: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().nullable(),
    avatar_url: z.string().url("Invalid image URL format").optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (full_name, phone_number, avatar_url) must be provided for update",
  }),
}).passthrough();

const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  }),
}).passthrough();

// Protected Profile Endpoints
router.get("/me", authenticateUser, asyncHandler(getProfile));
router.patch("/me", authenticateUser, validate(updateProfileSchema), asyncHandler(updateProfile));
router.patch("/me/change-password", authenticateUser, validate(changePasswordSchema), asyncHandler(changePassword));

export default router;