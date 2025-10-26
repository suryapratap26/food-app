import express from 'express';
import cartController from '../controllers/cart.controller.js';

const router = express.Router();

// All routes are protected globally by requireAuth in server.js
router.post('/', cartController.addToCart);
router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);
router.post('/remove', cartController.removeCart);

export default router;
