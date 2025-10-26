import express from 'express';
import orderController from '../controllers/order.controller.js';
import { checkAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();

// Create & verify
router.post('/create', orderController.createOrderWithPayment);
router.post('/verify', orderController.verifyPayment);

// User actions
router.get('/', orderController.getUserOrder);
router.delete('/:orderId', orderController.removeOrder);

// Admin actions
router.get('/all', checkAdminRole, orderController.getOrdersOfAllUsers);
router.put('/:orderId', checkAdminRole, orderController.updateOrder);

export default router;
