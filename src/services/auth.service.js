import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

export const signupService = async ({ fullName, email, password, role }) => {
  if (!fullName || !email || !password) {
    throw new Error("All fields are required.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser(fullName, email, hashedPassword, role);

  return user;
};

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
};
