import db from "../config/db.config.js";

export const QuizModel = {
  async create(data) {
    const query = `
      INSERT INTO quizzes (
        title, description, category, difficulty, duration_minutes, 
        passing_percentage, max_attempts, status, thumbnail_url, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      data.title,
      data.description || null,
      data.category,
      data.difficulty,
      data.duration_minutes,
      data.passing_percentage,
      data.max_attempts,
      data.status || "draft",
      data.thumbnail_url || null,
      data.created_by,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findById(id) {
    const query = `SELECT * FROM quizzes WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async findAll({ limit, offset, status, category, search }) {
    let query = `SELECT * FROM quizzes WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM quizzes WHERE 1=1`;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1};`;
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

  async update(id, data) {
    const query = `
      UPDATE quizzes
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        difficulty = COALESCE($4, difficulty),
        duration_minutes = COALESCE($5, duration_minutes),
        passing_percentage = COALESCE($6, passing_percentage),
        max_attempts = COALESCE($7, max_attempts),
        thumbnail_url = COALESCE($8, thumbnail_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;
    const values = [
      data.title,
      data.description,
      data.category,
      data.difficulty,
      data.duration_minutes,
      data.passing_percentage,
      data.max_attempts,
      data.thumbnail_url,
      id,
    ];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const query = `
      UPDATE quizzes
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [status, id]);
    return rows[0] || null;
  },

  async delete(id) {
    const query = `DELETE FROM quizzes WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
};