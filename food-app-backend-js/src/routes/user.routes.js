import express from 'express';
import userController from '../controllers/user.controller.js';
import contactController from '../controllers/contact.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';
import { checkAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();
router.post("/contact", contactController.sendContactForm);
router.post('/register', userController.registerUser);
router.post('/login', userController.login);
router.post('/admin/create', authenticate, checkAdminRole, userController.createAdmin);

export default router;
