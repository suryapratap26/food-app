import express from 'express';
import orderController from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();
const checkOrderManagerRole = (req, res, next) => {
  if (!req.user || !['ADMIN', 'RESTAURANT'].includes(req.user.role)) {
    return res
      .status(403)
      .send({ error: 'Access denied. Restaurant or admin privileges required.' });
  }
  next();
};

// Create & verify
router.post('/create', requireAuth, orderController.createOrderWithPayment);
router.post('/verify', requireAuth, orderController.verifyPayment);

// User actions
router.get('/', requireAuth, orderController.getUserOrder);
router.delete('/:orderId', requireAuth, orderController.removeOrder);

// Admin actions
router.get('/all', requireAuth, checkOrderManagerRole, orderController.getOrdersOfAllUsers);
router.get('/restaurant/earnings', requireAuth, checkOrderManagerRole, orderController.getRestaurantEarningsSummary);
router.post('/restaurant/claim', requireAuth, checkOrderManagerRole, orderController.claimRestaurantEarnings);
router.put('/:orderId', requireAuth, checkOrderManagerRole, orderController.updateOrder);

export default router;
