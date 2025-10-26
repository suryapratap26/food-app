import express from 'express';
import foodController from '../controllers/food.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkAdminRole } from '../middleware/admin.middleware.js';
import uploadMiddleware from '../middleware/upload.middleware.js';

const router = express.Router();

// ADMIN ONLY (Requires token, admin role, and file upload)
router.post('/', authenticate, checkAdminRole, uploadMiddleware, foodController.addFood);

// PUBLIC
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);

// ADMIN ONLY (Requires token and admin role)
router.delete('/:id', authenticate, checkAdminRole, foodController.deleteFood);

export default router;
