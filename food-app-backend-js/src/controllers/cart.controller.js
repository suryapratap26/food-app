import cartService from '../services/cart.service.js';

class CartController {
  async addToCart(req, res) {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).send('Food id is required');

    try {
      const response = await cartService.addToCart(req.userId, req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).send('Failed to add item to cart.');
    }
  }

  async getCart(req, res) {
    try {
      const response = await cartService.getCart(req.userId);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).send('Failed to retrieve cart.');
    }
  }

  async clearCart(req, res) {
    try {
      await cartService.clearCart(req.userId);
      res.status(200).end();
    } catch (error) {
      res.status(500).send('Failed to clear cart.');
    }
  }

  async removeCart(req, res) {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).send('Food id is required');

    try {
      const response = await cartService.removeFromCart(req.userId, req.body);
      if (response === null) {
        return res
          .status(200)
          .json({ message: 'Item not found or quantity was already zero.' });
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  }
}

export default new CartController();
