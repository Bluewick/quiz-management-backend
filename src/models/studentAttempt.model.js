import  db  from "../config/db.config.js";

export const StudentAttemptModel = {
  async countUserAttempts(quizId, userId) {
    const query = `
      SELECT COUNT(*)::INT 
      FROM quiz_attempts 
      WHERE quiz_id = $1 AND user_id = $2;
    `;
    const { rows } = await db.query(query, [quizId, userId]);
    return rows[0].count;
  },

  async findActiveAttempt(quizId, userId) {
    const query = `
      SELECT * 
      FROM quiz_attempts 
      WHERE quiz_id = $1 AND user_id = $2 AND status = 'in_progress' AND expires_at > CURRENT_TIMESTAMP
      ORDER BY started_at DESC
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [quizId, userId]);
    return rows[0] || null;
  },

  async findById(attemptId) {
    const query = `SELECT * FROM quiz_attempts WHERE id = $1;`;
    const { rows } = await db.query(query, [attemptId]);
    return rows[0] || null;
  },

  async createAttempt({ quiz_id, user_id, attempt_number, duration_minutes, total_marks }) {
    const query = `
      INSERT INTO quiz_attempts (
        quiz_id, user_id, attempt_number, status, total_marks, started_at, expires_at
      )
      VALUES (
        $1, $2, $3, 'in_progress', $4, CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP + ($5 || ' minutes')::INTERVAL
      )
      RETURNING *;
    `;
    const values = [quiz_id, user_id, attempt_number, total_marks, duration_minutes];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async upsertAnswer(attemptId, questionId, selectedOption) {
    const query = `
      INSERT INTO attempt_answers (attempt_id, question_id, selected_option, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (attempt_id, question_id)
      DO UPDATE SET 
        selected_option = EXCLUDED.selected_option,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await db.query(query, [attemptId, questionId, selectedOption]);
    return rows[0];
  },

  async getSavedAnswers(attemptId) {
    const query = `
      SELECT question_id, selected_option, is_correct, marks_obtained
      FROM attempt_answers
      WHERE attempt_id = $1;
    `;
    const { rows } = await db.query(query, [attemptId]);
    return rows;
  },

  async updateAttemptToTimedOut(attemptId) {
    const query = `
      UPDATE quiz_attempts
      SET status = 'timed_out', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [attemptId]);
    return rows[0];
  },

  async submitAttemptEvaluation(attemptId, { obtained_marks, percentage, is_passed, time_taken_seconds }) {
    const query = `
      UPDATE quiz_attempts
      SET 
        status = 'completed',
        obtained_marks = $1,
        percentage = $2,
        is_passed = $3,
        submitted_at = CURRENT_TIMESTAMP,
        time_taken_seconds = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [obtained_marks, percentage, is_passed, time_taken_seconds, attemptId];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async updateAnswerEvaluation(attemptId, questionId, isCorrect, marksObtained, selectedOption) {
    const query = `
      INSERT INTO attempt_answers (attempt_id, question_id, selected_option, is_correct, marks_obtained)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (attempt_id, question_id)
      DO UPDATE SET 
        selected_option = EXCLUDED.selected_option,
        is_correct = EXCLUDED.is_correct,
        marks_obtained = EXCLUDED.marks_obtained,
        updated_at = CURRENT_TIMESTAMP;
    `;
    await db.query(query, [attemptId, questionId, selectedOption || null, isCorrect, marksObtained]);
  },

  async getUserHistory(userId, { limit, offset }) {
    const query = `
      SELECT 
        qa.id AS attempt_id,
        qa.attempt_number,
        qa.status,
        qa.total_marks,
        qa.obtained_marks,
        qa.percentage,
        qa.is_passed,
        qa.started_at,
        qa.submitted_at,
        qa.time_taken_seconds,
        q.id AS quiz_id,
        q.title AS quiz_title,
        q.category AS quiz_category,
        q.difficulty AS quiz_difficulty
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1
      ORDER BY qa.started_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const countQuery = `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1;`;

    const [dataResult, countResult] = await Promise.all([
      db.query(query, [userId, limit, offset]),
      db.query(countQuery, [userId]),
    ]);

    return {
      attempts: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(id)::INT AS total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT AS completed_attempts,
        COUNT(CASE WHEN is_passed = true THEN 1 END)::INT AS passed_quizzes,
        COUNT(CASE WHEN is_passed = false AND status = 'completed' THEN 1 END)::INT AS failed_quizzes,
        COALESCE(AVG(percentage), 0)::NUMERIC(5,2) AS average_percentage,
        COALESCE(SUM(obtained_marks), 0)::NUMERIC(10,2) AS total_marks_earned
      FROM quiz_attempts
      WHERE user_id = $1;
    `;
    const categoryQuery = `
      SELECT 
        q.category,
        COUNT(qa.id)::INT AS attempts_count,
        COALESCE(AVG(qa.percentage), 0)::NUMERIC(5,2) AS avg_percentage
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1 AND qa.status = 'completed'
      GROUP BY q.category;
    `;

    const [overallResult, categoryResult] = await Promise.all([
      db.query(query, [userId]),
      db.query(categoryQuery, [userId]),
    ]);

    return {
      overall: overallResult.rows[0],
      categories: categoryResult.rows,
    };
  },

  async getAttemptReview(attemptId) {
    const query = `
      SELECT 
        q.id AS question_id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.explanation,
        q.marks AS question_marks,
        q.difficulty AS question_difficulty,
        COALESCE(ans.selected_option, NULL) AS user_selected_option,
        COALESCE(ans.is_correct, false) AS is_correct,
        COALESCE(ans.marks_obtained, 0.00) AS marks_obtained
      FROM questions q
      JOIN quiz_attempts qa ON q.quiz_id = qa.quiz_id
      LEFT JOIN attempt_answers ans ON ans.attempt_id = qa.id AND ans.question_id = q.id
      WHERE qa.id = $1
      ORDER BY q.created_at ASC;
    `;
    const { rows } = await db.query(query, [attemptId]);
    return rows;
  },
};