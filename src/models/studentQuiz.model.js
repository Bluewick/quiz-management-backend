import  db  from "../config/db.config.js";

export const StudentQuizModel = {
  async findPublished({ limit, offset, category, difficulty, search }) {
    let query = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.duration_minutes,
        q.passing_percentage,
        q.max_attempts,
        q.thumbnail_url,
        q.created_at,
        COUNT(ques.id)::INT AS total_questions,
        COALESCE(SUM(ques.marks), 0)::INT AS total_marks
      FROM quizzes q
      LEFT JOIN questions ques ON q.id = ques.quiz_id
      WHERE q.status = 'published'
    `;
    let countQuery = `SELECT COUNT(*) FROM quizzes WHERE status = 'published'`;
    const values = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND q.category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND q.difficulty = $${paramIndex}`;
      countQuery += ` AND difficulty = $${paramIndex}`;
      values.push(difficulty);
      paramIndex++;
    }

    if (search) {
      query += ` AND (q.title ILIKE $${paramIndex} OR q.description ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const queryValues = [...values, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      db.query(query, queryValues),
      db.query(countQuery, values),
    ]);

    return {
      quizzes: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findPublishedById(quizId, userId) {
    const query = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.duration_minutes,
        q.passing_percentage,
        q.max_attempts,
        q.thumbnail_url,
        q.created_at,
        COUNT(ques.id)::INT AS total_questions,
        COALESCE(SUM(ques.marks), 0)::INT AS total_marks,
        (
          SELECT COUNT(*)::INT 
          FROM quiz_attempts 
          WHERE quiz_id = q.id AND user_id = $2 AND status IN ('completed', 'timed_out')
        ) AS user_completed_attempts,
        (
          SELECT id 
          FROM quiz_attempts 
          WHERE quiz_id = q.id AND user_id = $2 AND status = 'in_progress' AND expires_at > CURRENT_TIMESTAMP
          LIMIT 1
        ) AS active_attempt_id
      FROM quizzes q
      LEFT JOIN questions ques ON q.id = ques.quiz_id
      WHERE q.id = $1 AND q.status = 'published'
      GROUP BY q.id;
    `;
    const { rows } = await db.query(query, [quizId, userId]);
    return rows[0] || null;
  },

  async getSanitizedQuestions(quizId) {
    const query = `
      SELECT 
        id,
        quiz_id,
        question_text,
        options,
        marks,
        difficulty
      FROM questions
      WHERE quiz_id = $1
      ORDER BY created_at ASC;
    `;
    const { rows } = await db.query(query, [quizId]);
    return rows;
  },

  async getQuizLeaderboard(quizId, limit = 10) {
    const query = `
      SELECT 
        qa.id AS attempt_id,
        qa.obtained_marks,
        qa.total_marks,
        qa.percentage,
        qa.time_taken_seconds,
        qa.submitted_at,
        u.id AS user_id,
        u.full_name,
        u.email
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.quiz_id = $1 AND qa.status = 'completed'
      ORDER BY qa.percentage DESC, qa.time_taken_seconds ASC, qa.submitted_at ASC
      LIMIT $2;
    `;
    const { rows } = await db.query(query, [quizId, limit]);
    return rows;
  },

  async getGlobalLeaderboard(limit = 10) {
    const query = `
      SELECT 
        u.id AS user_id,
        u.full_name,
        COUNT(qa.id)::INT AS total_quizzes_passed,
        COALESCE(SUM(qa.obtained_marks), 0)::NUMERIC(10,2) AS total_score,
        COALESCE(AVG(qa.percentage), 0)::NUMERIC(5,2) AS average_percentage
      FROM users u
      JOIN quiz_attempts qa ON u.id = qa.user_id
      WHERE qa.status = 'completed' AND qa.is_passed = true
      GROUP BY u.id, u.full_name
      ORDER BY total_quizzes_passed DESC, total_score DESC, average_percentage DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
  },
};