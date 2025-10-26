import orderService from '../services/order.service.js';

class OrderController {
  async createOrderWithPayment(req, res) {
    try {
      const response = await orderService.createOrderWithPayment(req.body, req.userId);
      res.status(200).json(response);
    } catch (error) {
      console.error('Create Order Error:', error.message);
      res.status(500).send({ message: error.message });
    }
  }

  async verifyPayment(req, res) {
    const verificationData = req.body;
    const paymentIntentId = verificationData.stripePaymentIntentId;
    const status = verificationData.status || 'UNKNOWN';

    try {
      await orderService.varifyPayment(verificationData, status);
      res
        .status(200)
        .send(`✅ Payment verified successfully for PI: ${paymentIntentId}`);
    } catch (error) {
      res.status(400).send({ message: `Payment verification failed: ${error.message}` });
    }
  }

  async getUserOrder(req, res) {
    try {
      const response = await orderService.getUserOrders(req.userId);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).send({ message: 'Failed to retrieve user orders.' });
    }
  }

  async removeOrder(req, res) {
    try {
      await orderService.removeOrder(req.params.orderId);
      res.status(200).end();
    } catch (error) {
      res.status(404).send({ message: 'Order not found or deletion failed.' });
    }
  }

  async getOrdersOfAllUsers(req, res) {
    try {
      const response = await orderService.getOrdersOfAllUsers();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).send({ message: 'Failed to retrieve all orders.' });
    }
  }

  async updateOrder(req, res) {
    const status = req.body.orderStatus;
    if (!status) return res.status(400).send({ message: 'Order status is required.' });

    try {
      const response = await orderService.updateOrder(req.params.orderId, status);
      res.status(200).json(response);
    } catch (error) {
      if (error.message.includes('Invalid order status')) {
        return res.status(400).send({ message: error.message });
      }
      res.status(404).send({ message: error.message });
    }
  }
}

export default new OrderController();
