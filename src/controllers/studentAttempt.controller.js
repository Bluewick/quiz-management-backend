import { StudentAttemptService } from "../services/studentAttempt.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const saveAnswer = async (req, res) => {
  const answer = await StudentAttemptService.saveAnswer(
    req.params.attemptId,
    req.user.id,
    req.body
  );
  return sendSuccess(res, 200, "Answer saved successfully", answer);
};

export const submitQuiz = async (req, res) => {
  const result = await StudentAttemptService.submitQuiz(
    req.params.attemptId,
    req.user.id,
    req.body.answers
  );
  return sendSuccess(res, 200, "Quiz submitted and evaluated successfully", result);
};

export const getAttemptResult = async (req, res) => {
  const data = await StudentAttemptService.getAttemptResult(req.params.attemptId, req.user.id);
  return sendSuccess(res, 200, "Quiz result retrieved successfully", data);
};

export const getAttemptReview = async (req, res) => {
  const review = await StudentAttemptService.getAttemptReview(req.params.attemptId, req.user.id);
  return sendSuccess(res, 200, "Detailed quiz review retrieved successfully", review);
};

export const getUserHistory = async (req, res) => {
  const { attempts, meta } = await StudentAttemptService.getUserHistory(req.user.id, req.query);
  return sendSuccess(res, 200, "Attempt history retrieved successfully", attempts, meta);
};

export const getUserStats = async (req, res) => {
  const stats = await StudentAttemptService.getUserStats(req.user.id);
  return sendSuccess(res, 200, "User performance analytics retrieved successfully", stats);
};