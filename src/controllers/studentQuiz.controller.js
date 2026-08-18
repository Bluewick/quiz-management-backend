import { StudentQuizService } from "../services/studentQuiz.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const getAvailableQuizzes = async (req, res) => {
  const { quizzes, meta } = await StudentQuizService.getAvailableQuizzes(req.query);
  return sendSuccess(res, 200, "Available quizzes retrieved successfully", quizzes, meta);
};

export const getQuizDetails = async (req, res) => {
  const quiz = await StudentQuizService.getQuizDetails(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Quiz details retrieved successfully", quiz);
};

export const startQuizAttempt = async (req, res) => {
  const session = await StudentQuizService.startQuizAttempt(req.params.id, req.user.id);
  return sendSuccess(res, 201, "Quiz session initialized successfully", session);
};

export const getQuizLeaderboard = async (req, res) => {
  const leaderboard = await StudentQuizService.getQuizLeaderboard(req.params.id);
  return sendSuccess(res, 200, "Quiz leaderboard retrieved successfully", leaderboard);
};

export const getGlobalLeaderboard = async (req, res) => {
  const leaderboard = await StudentQuizService.getGlobalLeaderboard();
  return sendSuccess(res, 200, "Global leaderboard retrieved successfully", leaderboard);
};