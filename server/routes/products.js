import { Router } from 'express';
import { body } from 'express-validator';
import { listProducts, getProductDetail, addProductReview, getProductsByCategory } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateFields } from '../middleware/validate.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductDetail);
router.get('/category/:slug', getProductsByCategory);

router.post(
  '/:id/reviews',
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    body('reviewText').notEmpty().withMessage('Review review text is required.'),
    validateFields
  ],
  addProductReview
);

export default router;
