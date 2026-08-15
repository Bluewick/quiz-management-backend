import { QuizModel } from "../models/quiz.model.js";
import { QuestionModel } from "../models/question.model.js";
import { ApiError } from "../utils/apiError.util.js";

export const QuizService = {
  async createQuiz(userId, payload) {
    return await QuizModel.create({
      ...payload,
      created_by: userId,
    });
  },

  async getQuizzes(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { quizzes, total } = await QuizModel.findAll({
      limit,
      offset,
      status: queryParams.status,
      category: queryParams.category,
      search: queryParams.search,
    });

    return {
      quizzes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getQuizById(id) {
    const quiz = await QuizModel.findById(id);
    if (!quiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }
    const questions = await QuestionModel.findByQuizId(id);
    return { ...quiz, questions };
  },

  async updateQuiz(id, payload) {
    const existingQuiz = await QuizModel.findById(id);
    if (!existingQuiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }

    return await QuizModel.update(id, payload);
  },

  async updateQuizStatus(id, status) {
    const existingQuiz = await QuizModel.findById(id);
    if (!existingQuiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }

    return await QuizModel.updateStatus(id, status);
  },

  async deleteQuiz(id) {
    const deleted = await QuizModel.delete(id);
    if (!deleted) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
    }
    return true;
  },
};