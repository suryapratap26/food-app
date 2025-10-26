import orderService from '../services/order.service.js';

class OrderController {
  async createOrderWithPayment(req, res) {
    try {
      const response = await orderService.createOrderWithPayment(req.body, req.userId);
      return res.status(201).json(response);
    } catch (error) {
      console.error('Create Order Error:', error);
      return res.status(500).json({ message: error.message || 'Failed to create order.' });
    }
  }

  async verifyPayment(req, res) {
    const verificationData = req.body || {};
    const paymentIntentId = verificationData.stripePaymentIntentId;
    const status = verificationData.status || 'UNKNOWN';

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'stripePaymentIntentId is required.' });
    }

    try {
      await orderService.verifyPayment(verificationData, status);
      return res.status(200).json({ message: `Payment verified successfully for PI: ${paymentIntentId}` });
    } catch (error) {
      console.error('Verify Payment Error:', error);
      return res.status(400).json({ message: error.message || 'Payment verification failed.' });
    }
  }

  async getUserOrder(req, res) {
    try {
      const response = await orderService.getUserOrders(req.userId);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Get User Orders Error:', error);
      return res.status(500).json({ message: 'Failed to retrieve user orders.' });
    }
  }

  async removeOrder(req, res) {
    try {
      await orderService.removeOrder(req.params.orderId);
      return res.status(204).end();
    } catch (error) {
      console.error('Remove Order Error:', error);
      return res.status(404).json({ message: error.message || 'Order not found or deletion failed.' });
    }
  }

  async getOrdersOfAllUsers(req, res) {
    try {
      const response = await orderService.getOrdersOfAllUsers();
      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Orders Error:', error);
      return res.status(500).json({ message: 'Failed to retrieve all orders.' });
    }
  }

  async updateOrder(req, res) {
    const status = req.body.orderStatus;
    if (!status) return res.status(400).json({ message: 'Order status is required.' });

    try {
      const response = await orderService.updateOrder(req.params.orderId, status);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Update Order Error:', error);
      if ((error.message || '').includes('Invalid order status')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(404).json({ message: error.message || 'Order not found.' });
    }
  }
}

export default new OrderController();
