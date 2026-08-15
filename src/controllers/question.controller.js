import { QuestionService } from "../services/question.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const addQuestion = async (req, res) => {
  const question = await QuestionService.addQuestionToQuiz(req.params.quizId, req.body);
  return sendSuccess(res, 201, "Question added successfully", question);
};

export const getQuestionsByQuiz = async (req, res) => {
  const questions = await QuestionService.getQuestionsByQuiz(req.params.quizId);
  return sendSuccess(res, 200, "Questions retrieved successfully", questions);
};

export const updateQuestion = async (req, res) => {
  const question = await QuestionService.updateQuestion(req.params.id, req.body);
  return sendSuccess(res, 200, "Question updated successfully", question);
};

export const deleteQuestion = async (req, res) => {
  await QuestionService.deleteQuestion(req.params.id);
  return sendSuccess(res, 200, "Question deleted successfully");
};