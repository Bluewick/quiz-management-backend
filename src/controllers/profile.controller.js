import { ProfileService } from "../services/profile.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const getProfile = async (req, res) => {
  const userId = req.user.id;
  const profile = await ProfileService.getProfile(userId);
  return sendSuccess(res, 200, "Profile retrieved successfully", profile);
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const updatedProfile = await ProfileService.updateProfile(userId, req.body);
  return sendSuccess(res, 200, "Profile updated successfully", updatedProfile);
};

export const changePassword = async (req, res) => {
  const userId = req.user.id;
  await ProfileService.changePassword(userId, req.body);
  return sendSuccess(res, 200, "Password changed successfully");
};