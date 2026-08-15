import  db  from "../config/db.config.js";

export const QuestionModel = {
  async create(data) {
    const query = `
      INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation, marks, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      data.quiz_id,
      data.question_text,
      JSON.stringify(data.options),
      data.correct_answer,
      data.explanation || null,
      data.marks,
      data.difficulty,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findByQuizId(quizId) {
    const query = `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at ASC;`;
    const { rows } = await db.query(query, [quizId]);
    return rows;
  },

  async findById(id) {
    const query = `SELECT * FROM questions WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async update(id, data) {
    const query = `
      UPDATE questions
      SET
        question_text = COALESCE($1, question_text),
        options = COALESCE($2, options),
        correct_answer = COALESCE($3, correct_answer),
        explanation = COALESCE($4, explanation),
        marks = COALESCE($5, marks),
        difficulty = COALESCE($6, difficulty),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      data.question_text,
      data.options ? JSON.stringify(data.options) : null,
      data.correct_answer,
      data.explanation,
      data.marks,
      data.difficulty,
      id,
    ];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    const query = `DELETE FROM questions WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
};