import express from 'express';
import foodController from '../controllers/food.controller.js';
import { authenticate, requireAuth } from '../middleware/auth.middleware.js';
import uploadMiddleware from '../middleware/upload.middleware.js';

const router = express.Router();
const checkFoodManagerRole = (req, res, next) => {
  if (!req.user || !['ADMIN', 'RESTAURANT'].includes(req.user.role)) {
    return res
      .status(403)
      .send({ error: 'Access denied. Restaurant or admin privileges required.' });
  }
  next();
};

// ADMIN ONLY (Requires token, admin role, and file upload)
router.post(
  '/',
  authenticate,
  requireAuth,
  checkFoodManagerRole,
  uploadMiddleware,
  foodController.addFood
);

// PUBLIC
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);
router.post(
  '/:id/reviews',
  authenticate,
  requireAuth,
  foodController.addReview
);

// ADMIN ONLY (Requires token and admin role)
router.delete(
  '/:id',
  authenticate,
  requireAuth,
  checkFoodManagerRole,
  foodController.deleteFood
);

export default router;
