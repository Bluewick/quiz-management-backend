import { ApiError } from "../utils/apiError.util.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    });

    if (!result.success) {
      // Access issues safely from ZodError to prevent runtime map crashes
      const issues = result.error?.issues || result.error?.errors || [];
      const details = issues.map((err) => ({
        field: err.path ? err.path.join(".") : "unknown",
        message: err.message,
      }));

      throw new ApiError(400, "VALIDATION_ERROR", "Invalid payload inputs.", details);
    }

    if (result.data.body) {
      req.body = result.data.body;
    }
    if (result.data.query) {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, result.data.query);
    }
    if (result.data.params) {
      Object.assign(req.params, result.data.params);
    }

    next();
  };
};