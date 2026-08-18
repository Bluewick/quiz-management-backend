import express from "express";
import { z } from "zod";
import {
  getAvailableQuizzes,
  getQuizDetails,
  startQuizAttempt,
  getQuizLeaderboard,
  getGlobalLeaderboard,
} from "../controllers/studentQuiz.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

const getQuizzesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    category: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    search: z.string().optional(),
  }),
}).passthrough();

const quizIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

// Student Quiz Discovery & Leaderboard Routes
router.get("/", authenticateUser, authorize("student", "admin"), validate(getQuizzesQuerySchema), asyncHandler(getAvailableQuizzes));
router.get("/leaderboard/global", authenticateUser, authorize("student", "admin"), asyncHandler(getGlobalLeaderboard));
router.get("/:id", authenticateUser, authorize("student", "admin"), validate(quizIdParamSchema), asyncHandler(getQuizDetails));
router.post("/:id/start", authenticateUser, authorize("student"), validate(quizIdParamSchema), asyncHandler(startQuizAttempt));
router.get("/:id/leaderboard", authenticateUser, authorize("student", "admin"), validate(quizIdParamSchema), asyncHandler(getQuizLeaderboard));

export default router;