import express from 'express';
import orderController from '../controllers/order.controller.js';
import { checkAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/verify', orderController.verifyPayment);

router.post('/create', orderController.createOrderWithPayment);
router.get('/', orderController.getUserOrder);
router.delete('/:orderId', orderController.removeOrder);

router.get('/all', checkAdminRole, orderController.getOrdersOfAllUsers);
router.put('/:orderId', checkAdminRole, orderController.updateOrder);

export default router;
