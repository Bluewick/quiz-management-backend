import express from "express";
import { z } from "zod";
import {
  getAllStudents,
  getStudentProfile,
  getStudentQuizHistory,
  getStudentPerformance,
  updateStudentStatus,
  deleteStudent,
} from "../controllers/userManagement.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

const getStudentsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
}).passthrough();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Student ID is required"),
  }),
}).passthrough();

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Student ID is required"),
  }),
  body: z.object({
    is_active: z.boolean({
      required_error: "is_active boolean field is required",
    }),
  }),
}).passthrough();

const historyQuerySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Student ID is required"),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  }),
}).passthrough();

// Admin Route Guards & Endpoint Definitions
router.get("/", authenticateUser, authorize("admin"), validate(getStudentsQuerySchema), asyncHandler(getAllStudents));
router.get("/:id", authenticateUser, authorize("admin"), validate(idParamSchema), asyncHandler(getStudentProfile));
router.get("/:id/history", authenticateUser, authorize("admin"), validate(historyQuerySchema), asyncHandler(getStudentQuizHistory));
router.get("/:id/performance", authenticateUser, authorize("admin"), validate(idParamSchema), asyncHandler(getStudentPerformance));
router.patch("/:id/status", authenticateUser, authorize("admin"), validate(updateStatusSchema), asyncHandler(updateStudentStatus));
router.delete("/:id", authenticateUser, authorize("admin"), validate(idParamSchema), asyncHandler(deleteStudent));

export default router;