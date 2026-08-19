import db from "../config/db.config.js";

export const ProfileModel = {
  async findById(userId) {
    const query = `
      SELECT 
        id,
        email,
        full_name,
        phone_number,
        avatar_url,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1 AND is_active = true;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0] || null;
  },

  async findPasswordHashById(userId) {
    const query = `
      SELECT id, password
      FROM users
      WHERE id = $1 AND is_active = true;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0] || null;
  },

  async updateProfile(userId, { fullName, phoneNumber, avatarUrl }) {
    const query = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        phone_number = COALESCE($2, phone_number),
        avatar_url = COALESCE($3, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND is_active = true
      RETURNING id, email, full_name, phone_number, avatar_url, role, is_active, created_at, updated_at;
    `;
    const values = [fullName || null, phoneNumber || null, avatarUrl || null, userId];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  async updatePassword(userId, newPasswordHash) {
    const query = `
      UPDATE users
      SET 
        password = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id, email, updated_at;
    `;
    const { rows } = await db.query(query, [newPasswordHash, userId]);
    return rows[0] || null;
  },
};