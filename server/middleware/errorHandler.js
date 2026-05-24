/**
 * Central Error Handler Middleware
 * Guarantees every error matches the requested envelope format:
 * Error: { "success": false, "message": "...", "errors": [...] }
 */
export const errorHandler = (err, req, res, next) => {
  console.error('SERVER_ERROR_CAUGHT_BY_MIDDLEWARE:', err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'An unexpected internal error occurred on the server.';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};
export default errorHandler;
