import db  from "../config/db.config.js";

export const createUser = async (fullName, email, hashedPassword, role) => {
  const query = `
        INSERT INTO users (full_name,email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, full_name, email, role, created_at;
        `;

  const values = [fullName, email, hashedPassword, role];

  const result = await db.query(query, values);

  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const query = `
        SELECT *
        FROM users
        WHERE email = $1;
    `;

  const values = [email];

  const result = await db.query(query, values);

  return result.rows[0];
};
