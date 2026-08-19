import { AdminStudentService } from "../services/userManagement.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const getAllStudents = async (req, res) => {
  const { students, meta } = await AdminStudentService.getAllStudents(req.query);
  return sendSuccess(res, 200, "Students retrieved successfully", students, meta);
};

export const getStudentProfile = async (req, res) => {
  const student = await AdminStudentService.getStudentProfile(req.params.id);
  return sendSuccess(res, 200, "Student profile retrieved successfully", student);
};

export const getStudentQuizHistory = async (req, res) => {
  const { history, meta } = await AdminStudentService.getStudentQuizHistory(
    req.params.id,
    req.query
  );
  return sendSuccess(res, 200, "Student quiz history retrieved successfully", history, meta);
};

export const getStudentPerformance = async (req, res) => {
  const performance = await AdminStudentService.getStudentPerformance(req.params.id);
  return sendSuccess(res, 200, "Student performance analytics retrieved successfully", performance);
};

export const updateStudentStatus = async (req, res) => {
  const updatedStudent = await AdminStudentService.updateStudentStatus(
    req.params.id,
    req.body.is_active
  );
  const statusLabel = updatedStudent.is_active ? "activated" : "deactivated";
  return sendSuccess(res, 200, `Student account ${statusLabel} successfully`, updatedStudent);
};

export const deleteStudent = async (req, res) => {
  const deletedStudent = await AdminStudentService.deleteStudent(req.params.id);
  return sendSuccess(res, 200, "Student account deleted successfully", deletedStudent);
};