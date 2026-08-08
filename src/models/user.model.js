import pool from "../config/db.js";

export const createUser = async (fullName, email, hashedPassword) => {
  const query = `
        INSERT INTO users (full_name,email, password)
        VALUES ($1, $2, $3)
        RETURNING id, full_name, email, created_at;
        `;

  const values = [fullName, email, hashedPassword];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const query = `
        SELECT *
        FROM users
        WHERE email = $1;
    `;

  const values = [email];

  const result = await pool.query(query, values);

  return result.rows[0];
};
