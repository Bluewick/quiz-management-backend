import bcrypt from "bcrypt";
import { ProfileModel } from "../models/profile.model.js";
import { ApiError } from "../utils/apiError.util.js";

const SALT_ROUNDS = 12;

export const ProfileService = {
  async getProfile(userId) {
    const user = await ProfileModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User profile not found or account is deactivated.");
    }
    return user;
  },

  async updateProfile(userId, updateData) {
    const existingUser = await ProfileModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "USER_NOT_FOUND", "User profile not found or account is deactivated.");
    }

    const updatedUser = await ProfileModel.updateProfile(userId, {
      fullName: updateData.full_name,
      phoneNumber: updateData.phone_number,
      avatarUrl: updateData.avatar_url,
    });

    return updatedUser;
  },

  async changePassword(userId, { current_password, new_password }) {
    const user = await ProfileModel.findPasswordHashById(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User account not found or deactivated.");
    }

    const isPasswordMatch = await bcrypt.compare(current_password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError(400, "INVALID_CREDENTIALS", "Current password provided is incorrect.");
    }

    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      throw new ApiError(400, "SAME_PASSWORD", "New password cannot be identical to the current password.");
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await ProfileModel.updatePassword(userId, newPasswordHash);

    return { message: "Password updated successfully." };
  },
};