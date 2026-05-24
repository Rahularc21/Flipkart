import { validationResult } from 'express-validator';

/**
 * Validator Result interceptor. Collects all errors gathered by field constraints.
 * Conforms strictly to Error: { "success": false, "message": "...", "errors": [...] }
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'One or more fields failed validation checks.',
      errors: errors.array().map(err => ({ field: err.path || err.param, message: err.msg }))
    });
  }
  next();
};
export default validateFields;
