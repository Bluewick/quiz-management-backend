import express from "express";
import { z } from "zod";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import {
  addQuestion,
  getQuestionsByQuiz,
} from "../controllers/question.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

// Helper schema for optional URLs submitted as empty strings from form inputs
const optionalUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .optional()
  .nullable()
  .transform((val) => (val === "" ? null : val));

const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().optional().nullable(),
    category: z.string().min(1, "Category is required"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    duration_minutes: z.coerce.number().int().positive("Duration must be a positive integer"),
    passing_percentage: z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100"),
    max_attempts: z.coerce.number().int().positive("Max attempts must be at least 1"),
    status: z.enum(["draft", "published", "unpublished"]).optional().default("draft"),
    thumbnail_url: optionalUrlSchema,
  }),
}).passthrough();

const getQuizzesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    status: z.enum(["draft", "published", "unpublished"]).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }),
}).passthrough();

const updateQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    category: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    duration_minutes: z.coerce.number().int().positive().optional(),
    passing_percentage: z.coerce.number().min(0).max(100).optional(),
    max_attempts: z.coerce.number().int().positive().optional(),
    thumbnail_url: optionalUrlSchema,
  }),
  params: z.object({ id: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["draft", "published", "unpublished"]),
  }),
  params: z.object({ id: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

const uuidParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

const addQuestionSchema = z.object({
  body: z.object({
    question_text: z.string().min(1, "Question text is required"),
    options: z.array(z.string()).min(2, "At least two options are required"),
    correct_answer: z.string().min(1, "Correct answer is required"),
    explanation: z.string().optional().nullable(),
    marks: z.coerce.number().int().positive().default(1),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  }),
  params: z.object({ quizId: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

const quizIdParamSchema = z.object({
  params: z.object({ quizId: z.string().uuid("Invalid Quiz ID format") }),
}).passthrough();

// Admin Quiz Management Endpoints
router.post("/", authenticateUser, authorize("admin"), validate(createQuizSchema), asyncHandler(createQuiz));
router.get("/", authenticateUser, authorize("admin"), validate(getQuizzesSchema), asyncHandler(getQuizzes));
router.get("/:id", authenticateUser, authorize("admin"), validate(uuidParamSchema), asyncHandler(getQuizById));
router.put("/:id", authenticateUser, authorize("admin"), validate(updateQuizSchema), asyncHandler(updateQuiz));
router.patch("/:id/status", authenticateUser, authorize("admin"), validate(updateStatusSchema), asyncHandler(updateQuizStatus));
router.delete("/:id", authenticateUser, authorize("admin"), validate(uuidParamSchema), asyncHandler(deleteQuiz));

// Nested Question Endpoints
router.post("/:quizId/questions", authenticateUser, authorize("admin"), validate(addQuestionSchema), asyncHandler(addQuestion));
router.get("/:quizId/questions", authenticateUser, authorize("admin"), validate(quizIdParamSchema), asyncHandler(getQuestionsByQuiz));

export default router;