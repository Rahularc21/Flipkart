import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, updateAddress } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateFields } from '../middleware/validate.js';

const router = Router();

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    validateFields
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validateFields
  ],
  login
);

router.get('/me', verifyToken, getMe);

router.post(
  '/address',
  verifyToken,
  [
    body('fullName').notEmpty().withMessage('Full Name is required.'),
    body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone count must be exactly 10 digits.'),
    body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be exactly 6 digits.'),
    body('locality').notEmpty().withMessage('Locality is required.'),
    body('addressLine').notEmpty().withMessage('Address details are required.'),
    body('city').notEmpty().withMessage('City is required.'),
    body('state').notEmpty().withMessage('State is required.'),
    validateFields
  ],
  updateAddress
);

export default router;
