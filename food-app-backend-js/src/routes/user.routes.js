import express from 'express';
import userController from '../controllers/user.controller.js';
import contactController from '../controllers/contact.controller.js'
import { authenticate, requireAuth } from '../middleware/auth.middleware.js';
import { checkAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();
router.post("/contact", contactController.sendContactForm);
router.post('/register', userController.registerUser);
router.post('/login', userController.login);
router.get('/profile', authenticate, requireAuth, userController.getProfile);
router.put('/profile', authenticate, requireAuth, userController.upsertProfile);
router.post('/admin/create', authenticate, checkAdminRole, userController.createAdmin);
router.get('/admin/restaurants/pending', authenticate, requireAuth, checkAdminRole, userController.getPendingRestaurants);
router.put('/admin/restaurants/:restaurantId/approval', authenticate, requireAuth, checkAdminRole, userController.updateRestaurantApproval);

export default router;
