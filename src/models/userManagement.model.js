import db from "../config/db.config.js";

export const AdminStudentModel = {
  async findAllStudents({ limit, offset, search, isActive }) {
    let whereConditions = [`u.role = 'student'`];
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined && isActive !== null) {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.is_active,
        u.created_at AS registration_date,
        COUNT(qa.id)::INT AS quizzes_attempted,
        COALESCE(ROUND(AVG(qa.percentage), 2), 0.00)::FLOAT AS average_score,
        COALESCE(ROUND(MAX(qa.percentage), 2), 0.00)::FLOAT AS highest_score
      FROM users u
      LEFT JOIN quiz_attempts qa 
        ON u.id = qa.user_id 
        AND qa.status IN ('completed', 'timed_out')
      WHERE ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const countQuery = `
      SELECT COUNT(*)::INT 
      FROM users u
      WHERE ${whereClause};
    `;

    const queryValues = [...values, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      db.query(query, queryValues),
      db.query(countQuery, values),
    ]);

    return {
      students: dataResult.rows,
      total: countResult.rows[0].count,
    };
  },

  async findStudentById(studentId) {
    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.is_active,
        u.created_at AS registration_date,
        u.updated_at,
        COUNT(qa.id)::INT AS quizzes_attempted,
        COALESCE(ROUND(AVG(qa.percentage), 2), 0.00)::FLOAT AS average_score,
        COALESCE(ROUND(MAX(qa.percentage), 2), 0.00)::FLOAT AS highest_score
      FROM users u
      LEFT JOIN quiz_attempts qa 
        ON u.id = qa.user_id 
        AND qa.status IN ('completed', 'timed_out')
      WHERE u.id = $1 AND u.role = 'student'
      GROUP BY u.id;
    `;
    const { rows } = await db.query(query, [studentId]);
    return rows[0] || null;
  },

  async findStudentQuizHistory(studentId, { limit, offset }) {
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

    const countQuery = `
      SELECT COUNT(*)::INT 
      FROM quiz_attempts 
      WHERE user_id = $1;
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(query, [studentId, limit, offset]),
      db.query(countQuery, [studentId]),
    ]);

    return {
      history: dataResult.rows,
      total: countResult.rows[0].count,
    };
  },

  async getStudentPerformance(studentId) {
    const overallQuery = `
      SELECT 
        COUNT(id)::INT AS total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT AS completed_attempts,
        COUNT(CASE WHEN is_passed = true THEN 1 END)::INT AS passed_quizzes,
        COUNT(CASE WHEN is_passed = false AND status = 'completed' THEN 1 END)::INT AS failed_quizzes,
        COALESCE(ROUND(AVG(percentage), 2), 0.00)::FLOAT AS average_percentage,
        COALESCE(ROUND(MAX(percentage), 2), 0.00)::FLOAT AS highest_percentage,
        COALESCE(ROUND(SUM(obtained_marks), 2), 0.00)::FLOAT AS total_marks_earned,
        COALESCE(ROUND(AVG(time_taken_seconds), 0), 0)::INT AS avg_time_taken_seconds
      FROM quiz_attempts
      WHERE user_id = $1;
    `;

    const categoryQuery = `
      SELECT 
        q.category,
        COUNT(qa.id)::INT AS attempts_count,
        COALESCE(ROUND(AVG(qa.percentage), 2), 0.00)::FLOAT AS avg_percentage,
        COALESCE(ROUND(MAX(qa.percentage), 2), 0.00)::FLOAT AS max_percentage
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1 AND qa.status = 'completed'
      GROUP BY q.category;
    `;

    const [overallResult, categoryResult] = await Promise.all([
      db.query(overallQuery, [studentId]),
      db.query(categoryQuery, [studentId]),
    ]);

    return {
      overall: overallResult.rows[0],
      categories: categoryResult.rows,
    };
  },

  async updateStudentStatus(studentId, isActive) {
    const query = `
      UPDATE users
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND role = 'student'
      RETURNING id, full_name, email, role, is_active, updated_at;
    `;
    const { rows } = await db.query(query, [isActive, studentId]);
    return rows[0] || null;
  },

  async deleteStudent(studentId) {
    const query = `
      DELETE FROM users
      WHERE id = $1 AND role = 'student'
      RETURNING id, full_name, email;
    `;
    const { rows } = await db.query(query, [studentId]);
    return rows[0] || null;
  },
};