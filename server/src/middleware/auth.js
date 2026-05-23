import jwt from 'jsonwebtoken';
import { User } from '../models/db.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Bearer token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'SECRET_FLIPKART_CLONE_KEY_SUPER_SAFE';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Invalid, expired, or corrupted token.'
      });
    }

    const dbUser = await User.findById(decoded.id);
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: 'Authorized user account no longer exists in database.'
      });
    }

    // Attach user (sanitize password)
    const sanitizedUser = { ...dbUser };
    delete sanitizedUser.password;

    req.user = sanitizedUser;
    next();
  } catch (err) {
    next(err);
  }
};
