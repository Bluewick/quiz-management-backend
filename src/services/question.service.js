import { QuestionModel } from "../models/question.model.js";
import { QuizModel } from "../models/quiz.model.js";
import { ApiError } from "../utils/apiError.util.js";

export const QuestionService = {
  async addQuestionToQuiz(quizId, payload) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }

    return await QuestionModel.create({
      ...payload,
      quiz_id: quizId,
    });
  },

  async getQuestionsByQuiz(quizId) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }
    return await QuestionModel.findByQuizId(quizId);
  },

  async updateQuestion(questionId, payload) {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw new ApiError(404, "QUESTION_NOT_FOUND", "Question not found.");
    }

    return await QuestionModel.update(questionId, payload);
  },

  async deleteQuestion(questionId) {
    const deleted = await QuestionModel.delete(questionId);
    if (!deleted) {
      throw new ApiError(404, "QUESTION_NOT_FOUND", "Question not found.");
    }
    return true;
  },
};