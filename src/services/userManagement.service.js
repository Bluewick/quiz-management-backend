import { AdminStudentModel } from "../models/userManagement.model.js";
import { ApiError } from "../utils/apiError.util.js";

export const AdminStudentService = {
  async getAllStudents(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let isActive;
    if (queryParams.status === "active") isActive = true;
    if (queryParams.status === "inactive") isActive = false;

    const { students, total } = await AdminStudentModel.findAllStudents({
      limit,
      offset,
      search: queryParams.search,
      isActive,
    });

    return {
      students,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStudentProfile(studentId) {
    const student = await AdminStudentModel.findStudentById(studentId);
    if (!student) {
      throw new ApiError(404, "STUDENT_NOT_FOUND", "Student record not found.");
    }
    return student;
  },

  async getStudentQuizHistory(studentId, queryParams) {
    const student = await AdminStudentModel.findStudentById(studentId);
    if (!student) {
      throw new ApiError(404, "STUDENT_NOT_FOUND", "Student record not found.");
    }

    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { history, total } = await AdminStudentModel.findStudentQuizHistory(studentId, {
      limit,
      offset,
    });

    return {
      history,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStudentPerformance(studentId) {
    const student = await AdminStudentModel.findStudentById(studentId);
    if (!student) {
      throw new ApiError(404, "STUDENT_NOT_FOUND", "Student record not found.");
    }

    const performance = await AdminStudentModel.getStudentPerformance(studentId);
    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        registration_date: student.registration_date,
      },
      performance,
    };
  },

  async updateStudentStatus(studentId, isActive) {
    const updatedStudent = await AdminStudentModel.updateStudentStatus(studentId, isActive);
    if (!updatedStudent) {
      throw new ApiError(404, "STUDENT_NOT_FOUND", "Student record not found.");
    }
    return updatedStudent;
  },

  async deleteStudent(studentId) {
    const deletedStudent = await AdminStudentModel.deleteStudent(studentId);
    if (!deletedStudent) {
      throw new ApiError(404, "STUDENT_NOT_FOUND", "Student record not found.");
    }
    return deletedStudent;
  },
};