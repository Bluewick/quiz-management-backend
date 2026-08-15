export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const responseBody = {
    success: true,
    message,
  };

  if (data !== null) {
    responseBody.data = data;
  }

  if (meta !== null) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
};

export const sendError = (res, statusCode, code, message, details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};