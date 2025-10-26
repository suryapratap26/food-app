import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Stripe from 'stripe';

// Initialize Stripe outside the class for performance
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const VALID_ORDER_STATUSES = [
  'PLACED',
  'PROCESSING',
  'PREPARING',
  'DELIVERED',
  'CANCELLED',
];

class OrderService {
  // --- Helper Methods ---

  /**
   * Converts a client request object into a new Mongoose Order entity.
   */
  converToEntity(orderRequest, userId) {
    return new Order({
      userId,
      userAddress: orderRequest.userAddress,
      amount: orderRequest.amount,
      orderItemsList: orderRequest.orderItems,
      phoneNumber: orderRequest.phoneNumber,
      email: orderRequest.email,
      paymentStatus: 'PENDING_INTENT_CREATION',
      orderStatus: 'INITIATED',
    });
  }

  /**
   * Converts a Mongoose Order entity into a standardized response object for the client.
   * FIX: Changed 'OrderedItems' to 'orderedItems' to match frontend consumption.
   */
  convertToResponse(order) {
    // Basic null check for the input object
    if (!order) return null;

    return {
      id: order._id?.toString(),
      userId: order.userId,
      userAddress: order.userAddress,
      phoneNumber: order.phoneNumber,
      email: order.email,
      amount: order.amount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      // FIX: Standardized to camelCase
      orderedItems: order.orderItemsList || [],
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeClientSecret: order.stripeClientSecret,
    };
  }

  // --- Core Methods ---

  async createOrderWithPayment(request, userId) {
    let order = this.converToEntity(request, userId);
    // Use transaction in real app, but for now, save sequentially
    order = await order.save();

    try {
      // Amount must be in the smallest currency unit (e.g., cents/paise)
      const amountInSmallestUnit = Math.round(order.amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: 'inr',
        metadata: { order_id: order._id.toString(), user_id: userId },
      });

      // Update order with payment intent details
      order.stripePaymentIntentId = paymentIntent.id;
      order.stripeClientSecret = paymentIntent.client_secret;
      order.paymentStatus = 'PENDING';
      order.orderStatus = 'AWAITING_PAYMENT';
    } catch (e) {
      console.error('Stripe Error creating Payment Intent:', e.message);
      // It's critical to delete the partially created order here if payment initiation fails
      await Order.findByIdAndDelete(order._id); 
      throw new Error('Failed to initiate payment with Stripe. Order aborted.');
    }

    order = await order.save();
    return this.convertToResponse(order);
  }

  async varifyPayment(paymentData, status) {
    const paymentIntentId = paymentData.stripePaymentIntentId;
    if (!paymentIntentId) {
      throw new Error('Missing Payment Intent ID for verification.');
    }

    // Assuming Order.findByStripePaymentIntentId exists and is efficient
    const order = await Order.findByStripePaymentIntentId(paymentIntentId);
    if (!order) {
      throw new Error(`Order not found for Payment Intent ID: ${paymentIntentId}`);
    }

    const lowerStatus = status.toLowerCase();

    if (lowerStatus === 'succeeded' || lowerStatus === 'success' || lowerStatus === 'paid') {
      order.set({ paymentStatus: 'SUCCESS', orderStatus: 'PROCESSING' });
      // Clear the cart only upon successful payment
      await Cart.deleteByUserId(order.userId);
      console.log(`✅ Order ${order.id} marked as SUCCESS and cart cleared.`);
    } else if (lowerStatus === 'failed' || lowerStatus === 'denied') {
      order.set({ paymentStatus: 'FAILED', orderStatus: 'PAYMENT_FAILED' });
    } else {
      // For any other status, just record it (e.g., 'CANCELED')
      order.paymentStatus = status.toUpperCase();
    }

    await order.save();
  }

  async getUserOrders(userId) {
    // Find orders and sort by creation date descending
    const list = await Order.findByUserId(userId).sort({ createdAt: -1 }); 
    
    // Ensure list is not null/undefined before mapping
    if (!list) return []; 
    
    return list.map((o) => this.convertToResponse(o));
  }

  async removeOrder(orderId) {
    const result = await Order.findByIdAndDelete(orderId);
    if (!result) {
      // Throw an error for a cleaner 404 response in the controller
      throw new Error(`Order with ID ${orderId} not found.`);
    }
  }

  async getOrdersOfAllUsers() {
    // Find all orders and sort by creation date descending
    const list = await Order.find({}).sort({ createdAt: -1 }); 
    
    return list.map((o) => this.convertToResponse(o));
  }

  async updateOrder(orderId, status) {
    const upperStatus = status.toUpperCase();
    
    if (!VALID_ORDER_STATUSES.includes(upperStatus)) {
      throw new Error(`Invalid order status provided: ${status}. Valid statuses are: ${VALID_ORDER_STATUSES.join(', ')}`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order does not exist');
    }

    if (order.orderStatus === upperStatus) {
      return this.convertToResponse(order);
    }

    order.orderStatus = upperStatus;
    await order.save();
    
    return this.convertToResponse(order);
  }
}

export default new OrderService();