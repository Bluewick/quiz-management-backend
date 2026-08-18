import { StudentQuizModel } from "../models/studentQuiz.model.js";
import { StudentAttemptModel } from "../models/studentAttempt.model.js";
import { ApiError } from "../utils/apiError.util.js";

export const StudentQuizService = {
  async getAvailableQuizzes(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { quizzes, total } = await StudentQuizModel.findPublished({
      limit,
      offset,
      category: queryParams.category,
      difficulty: queryParams.difficulty,
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

  async getQuizDetails(quizId, userId) {
    const quiz = await StudentQuizModel.findPublishedById(quizId, userId);
    if (!quiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found or not published.");
    }

    const remainingAttempts = Math.max(0, quiz.max_attempts - quiz.user_completed_attempts);

    return {
      ...quiz,
      remaining_attempts: remainingAttempts,
      can_attempt: remainingAttempts > 0 || !!quiz.active_attempt_id,
    };
  },

  async startQuizAttempt(quizId, userId) {
    const quiz = await StudentQuizModel.findPublishedById(quizId, userId);
    if (!quiz) {
      throw new ApiError(404, "QUIZ_NOT_FOUND", "Quiz not found or is unaccessible.");
    }

    // Return active attempt session if quiz is already in progress
    const activeAttempt = await StudentAttemptModel.findActiveAttempt(quizId, userId);
    if (activeAttempt) {
      const questions = await StudentQuizModel.getSanitizedQuestions(quizId);
      const savedAnswers = await StudentAttemptModel.getSavedAnswers(activeAttempt.id);

      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeAttempt.expires_at).getTime() - Date.now()) / 1000)
      );

      return {
        attempt: activeAttempt,
        remaining_seconds: remainingSeconds,
        questions,
        saved_answers: savedAnswers,
      };
    }

    // Check maximum attempts boundary
    const previousAttemptsCount = await StudentAttemptModel.countUserAttempts(quizId, userId);
    if (previousAttemptsCount >= quiz.max_attempts) {
      throw new ApiError(400, "MAX_ATTEMPTS_EXCEEDED", "Maximum attempts reached for this quiz.");
    }

    const questions = await StudentQuizModel.getSanitizedQuestions(quizId);
    if (questions.length === 0) {
      throw new ApiError(400, "EMPTY_QUIZ", "Cannot start quiz as it has no questions configured.");
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const newAttempt = await StudentAttemptModel.createAttempt({
      quiz_id: quizId,
      user_id: userId,
      attempt_number: previousAttemptsCount + 1,
      duration_minutes: quiz.duration_minutes,
      total_marks: totalMarks,
    });

    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(newAttempt.expires_at).getTime() - Date.now()) / 1000)
    );

    return {
      attempt: newAttempt,
      remaining_seconds: remainingSeconds,
      questions,
      saved_answers: [],
    };
  },

  async getQuizLeaderboard(quizId) {
    const leaderboard = await StudentQuizModel.getQuizLeaderboard(quizId);
    return leaderboard;
  },

  async getGlobalLeaderboard() {
    return await StudentQuizModel.getGlobalLeaderboard(10);
  },
};