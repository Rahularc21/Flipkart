import { Router } from 'express';
import { createOrder, listMyOrders, getOrderDetail, cancelOrder } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.post('/', createOrder);
router.get('/me', listMyOrders);
router.get('/:id', getOrderDetail);
router.post('/:id/cancel', cancelOrder);

export default router;
