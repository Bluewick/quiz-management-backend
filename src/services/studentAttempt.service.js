import { StudentAttemptModel } from "../models/studentAttempt.model.js";
import { StudentQuizModel } from "../models/studentQuiz.model.js";
import  db  from "../config/db.config.js";
import { ApiError } from "../utils/apiError.util.js";

export const StudentAttemptService = {
  async saveAnswer(attemptId, userId, { question_id, selected_option }) {
    const attempt = await StudentAttemptModel.findById(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      throw new ApiError(404, "ATTEMPT_NOT_FOUND", "Attempt session not found.");
    }

    if (attempt.status !== "in_progress") {
      throw new ApiError(400, "ATTEMPT_CLOSED", "This quiz attempt is no longer active.");
    }

    if (new Date() > new Date(attempt.expires_at)) {
      await StudentAttemptModel.updateAttemptToTimedOut(attemptId);
      throw new ApiError(400, "TIME_EXPIRED", "Time limit expired. Attempt auto-closed.");
    }

    return await StudentAttemptModel.upsertAnswer(attemptId, question_id, selected_option);
  },

  async submitQuiz(attemptId, userId, answersPayload = []) {
    const attempt = await StudentAttemptModel.findById(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      throw new ApiError(404, "ATTEMPT_NOT_FOUND", "Attempt session not found.");
    }

    if (attempt.status !== "in_progress") {
      throw new ApiError(400, "ATTEMPT_CLOSED", "Quiz has already been submitted.");
    }

    const quiz = await StudentQuizModel.findPublishedById(attempt.quiz_id, userId);
    const { rows: questions } = await db.query(
      `SELECT id, correct_answer, marks FROM questions WHERE quiz_id = $1`,
      [attempt.quiz_id]
    );

    // Save final batch answers if passed directly with submit
    if (Array.isArray(answersPayload) && answersPayload.length > 0) {
      for (const ans of answersPayload) {
        if (ans.question_id && ans.selected_option !== undefined) {
          await StudentAttemptModel.upsertAnswer(attemptId, ans.question_id, ans.selected_option);
        }
      }
    }

    const savedAnswers = await StudentAttemptModel.getSavedAnswers(attemptId);
    const answerMap = new Map(savedAnswers.map((a) => [a.question_id, a.selected_option]));

    let obtainedMarks = 0;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    for (const question of questions) {
      const userOption = answerMap.get(question.id);
      const isCorrect =
        userOption !== undefined &&
        userOption !== null &&
        String(userOption).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();

      const marksEarned = isCorrect ? parseFloat(question.marks) : 0;
      obtainedMarks += marksEarned;

      await StudentAttemptModel.updateAnswerEvaluation(
        attemptId,
        question.id,
        isCorrect,
        marksEarned,
        userOption
      );
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const isPassed = percentage >= parseFloat(quiz.passing_percentage);
    const startTime = new Date(attempt.started_at).getTime();
    const timeTakenSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    const updatedAttempt = await StudentAttemptModel.submitAttemptEvaluation(attemptId, {
      obtained_marks: obtainedMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      is_passed: isPassed,
      time_taken_seconds: timeTakenSeconds,
    });

    return updatedAttempt;
  },

  async getAttemptResult(attemptId, userId) {
    const attempt = await StudentAttemptModel.findById(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      throw new ApiError(404, "ATTEMPT_NOT_FOUND", "Attempt session not found.");
    }

    if (attempt.status === "in_progress") {
      throw new ApiError(400, "ATTEMPT_NOT_SUBMITTED", "Quiz attempt is still in progress.");
    }

    const quiz = await StudentQuizModel.findPublishedById(attempt.quiz_id, userId);
    return {
      attempt,
      quiz: {
        title: quiz.title,
        category: quiz.category,
        passing_percentage: quiz.passing_percentage,
      },
    };
  },

  async getAttemptReview(attemptId, userId) {
    const attempt = await StudentAttemptModel.findById(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      throw new ApiError(404, "ATTEMPT_NOT_FOUND", "Attempt session not found.");
    }

    if (attempt.status === "in_progress") {
      throw new ApiError(400, "ATTEMPT_NOT_SUBMITTED", "Cannot review active attempts.");
    }

    const questionsReview = await StudentAttemptModel.getAttemptReview(attemptId);
    return {
      attempt,
      review: questionsReview,
    };
  },

  async getUserHistory(userId, queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { attempts, total } = await StudentAttemptModel.getUserHistory(userId, { limit, offset });

    return {
      attempts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getUserStats(userId) {
    return await StudentAttemptModel.getUserStats(userId);
  },
};