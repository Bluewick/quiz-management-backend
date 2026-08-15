import { ApiError } from "../utils/apiError.util.js";
import { sendError } from "../utils/response.util.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.errorCode, err.message, err.details);
  }

  console.error("Unhandled Error:", err);

  return sendError(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred on the server.",
    []
  );
};