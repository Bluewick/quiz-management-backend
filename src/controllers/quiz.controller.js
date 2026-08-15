import { QuizService } from "../services/quiz.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const createQuiz = async (req, res) => {
  const quiz = await QuizService.createQuiz(req.user.id, req.body);
  return sendSuccess(res, 201, "Quiz created successfully", quiz);
};

export const getQuizzes = async (req, res) => {
  const { quizzes, meta } = await QuizService.getQuizzes(req.query);
  return sendSuccess(res, 200, "Quizzes retrieved successfully", quizzes, meta);
};

export const getQuizById = async (req, res) => {
  const quiz = await QuizService.getQuizById(req.params.id);
  return sendSuccess(res, 200, "Quiz details retrieved successfully", quiz);
};

export const updateQuiz = async (req, res) => {
  const updatedQuiz = await QuizService.updateQuiz(req.params.id, req.body);
  return sendSuccess(res, 200, "Quiz updated successfully", updatedQuiz);
};

export const updateQuizStatus = async (req, res) => {
  const updatedQuiz = await QuizService.updateQuizStatus(req.params.id, req.body.status);
  return sendSuccess(res, 200, "Quiz status updated successfully", updatedQuiz);
};

export const deleteQuiz = async (req, res) => {
  await QuizService.deleteQuiz(req.params.id);
  return sendSuccess(res, 200, "Quiz deleted successfully");
};