import express from "express";
import { z } from "zod";
import {
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import { authenticateUser, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const router = express.Router();

const updateQuestionSchema = z.object({
  body: z.object({
    question_text: z.string().min(1).optional(),
    options: z.array(z.string()).min(2).optional(),
    correct_answer: z.string().min(1).optional(),
    explanation: z.string().optional(),
    marks: z.number().int().positive().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
  params: z.object({ id: z.string().uuid("Invalid Question ID") }),
  query: z.object({}),
});

const questionIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().uuid("Invalid Question ID") }),
  query: z.object({}),
});

// Direct Question Operations
router.put("/:id", authenticateUser, authorize("admin"), validate(updateQuestionSchema), asyncHandler(updateQuestion));
router.delete("/:id", authenticateUser, authorize("admin"), validate(questionIdParamSchema), asyncHandler(deleteQuestion));

export default router;