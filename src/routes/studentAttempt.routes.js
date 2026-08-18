import express from "express";
import { z } from "zod";
import {
  saveAnswer,
  submitQuiz,
  getAttemptResult,
  getAttemptReview,
  getUserHistory,
  getUserStats,
} from "../controllers/studentAttempt.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

const saveAnswerSchema = z.object({
  params: z.object({ attemptId: z.string().uuid("Invalid Attempt ID format") }),
  body: z.object({
    question_id: z.string().uuid("Invalid Question ID format"),
    selected_option: z.string().min(1, "Option string cannot be empty"),
  }),
}).passthrough();

const submitAttemptSchema = z.object({
  params: z.object({ attemptId: z.string().uuid("Invalid Attempt ID format") }),
  body: z.object({
    answers: z.array(
      z.object({
        question_id: z.string().uuid(),
        selected_option: z.string(),
      })
    ).optional(),
  }),
}).passthrough();

const attemptIdParamSchema = z.object({
  params: z.object({ attemptId: z.string().uuid("Invalid Attempt ID format") }),
}).passthrough();

const historyQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  }),
}).passthrough();

// Student Attempt Execution & Results Routes
router.get("/me/history", authenticateUser, authorize("student"), validate(historyQuerySchema), asyncHandler(getUserHistory));
router.get("/me/stats", authenticateUser, authorize("student"), asyncHandler(getUserStats));
router.post("/:attemptId/save-answer", authenticateUser, authorize("student"), validate(saveAnswerSchema), asyncHandler(saveAnswer));
router.post("/:attemptId/submit", authenticateUser, authorize("student"), validate(submitAttemptSchema), asyncHandler(submitQuiz));
router.get("/:attemptId/result", authenticateUser, authorize("student", "admin"), validate(attemptIdParamSchema), asyncHandler(getAttemptResult));
router.get("/:attemptId/review", authenticateUser, authorize("student", "admin"), validate(attemptIdParamSchema), asyncHandler(getAttemptReview));

export default router;