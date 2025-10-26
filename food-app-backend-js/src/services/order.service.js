import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Stripe from "stripe";

// ==========================================================
// 🛑 CHANGE 1: Remove the immediate top-level initialization
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 
// ==========================================================

// Declare a variable for the Stripe client and a helper function
let stripeClient = null;

function getStripeClient() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // Throw a specific error if the key is still missing (good for debugging)
      throw new Error("Stripe Secret Key is missing from environment variables.");
    }
    // Initialize the Stripe client here, guaranteed to be after dotenv.config()
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const VALID_ORDER_STATUSES = [
  "PLACED",
  "PROCESSING",
  "PREPARING",
  "DELIVERED",
  "CANCELLED",
];

class OrderService {
  // Helpers
  convertToEntity(orderRequest, userId) {
    return new Order({
      userId,
      userAddress: orderRequest.userAddress,
      amount: orderRequest.amount,
      orderItemsList: orderRequest.orderItems || [],
      phoneNumber: orderRequest.phoneNumber,
      email: orderRequest.email,
      paymentStatus: "PENDING_INTENT_CREATION",
      orderStatus: "INITIATED",
    });
  }

  convertToResponse(order) {
    return {
      id: order._id.toString(),
      userId: order.userId,
      userAddress: order.userAddress,
      phoneNumber: order.phoneNumber,
      email: order.email,
      amount: order.amount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderedItems: order.orderItemsList || [],
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeClientSecret: order.stripeClientSecret,
    };
  }

  // Core methods
  async createOrderWithPayment(request, userId) {
    let order = this.convertToEntity(request, userId);
    order = await order.save();

    try {
      // ==========================================================
      // ✅ CHANGE 2: Get the lazily initialized client here
      const stripe = getStripeClient(); 
      // ==========================================================
      
      const amountInSmallestUnit = Math.round(order.amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({ // Use the local 'stripe' variable
        amount: amountInSmallestUnit,
        currency: "inr",
        metadata: { order_id: order._id.toString(), user_id: userId },
      });

      order.stripePaymentIntentId = paymentIntent.id;
      order.stripeClientSecret = paymentIntent.client_secret;
      order.paymentStatus = "PENDING";
      order.orderStatus = "AWAITING_PAYMENT";
    } catch (e) {
      console.error("Stripe Error creating Payment Intent:", e.message);
      throw new Error("Failed to initiate payment with Stripe.");
    }

    order = await order.save();
    return this.convertToResponse(order);
  }

  async verifyPayment(paymentData, status) {
    const paymentIntentId = paymentData.stripePaymentIntentId;
    if (!paymentIntentId) throw new Error("Missing Payment Intent ID for verification.");

    const order = await Order.findByStripePaymentIntentId(paymentIntentId);
    if (!order) throw new Error(`Order not found for Payment Intent ID: ${paymentIntentId}`);

    const lowerStatus = (status || "").toLowerCase();

    if (["succeeded", "success", "paid"].includes(lowerStatus)) {
      order.set({ paymentStatus: "SUCCESS", orderStatus: "PROCESSING" });
      await Cart.deleteByUserId(order.userId);
      console.log(`✅ Order ${order._id.toString()} marked SUCCESS and cart cleared.`);
    } else if (["failed", "denied", "canceled", "cancelled"].includes(lowerStatus)) {
      order.set({ paymentStatus: "FAILED", orderStatus: "PAYMENT_FAILED" });
    } else {
      order.paymentStatus = (status || "").toUpperCase();
    }

    await order.save();
  }

  async getUserOrders(userId) {
    const list = await Order.findByUserId(userId);
    return list.map((o) => this.convertToResponse(o));
  }

  async removeOrder(orderId) {
    await Order.findByIdAndDelete(orderId);
  }

  async getOrdersOfAllUsers() {
    const list = await Order.find({});
    return list.map((o) => this.convertToResponse(o));
  }

  async updateOrder(orderId, status) {
    const upperStatus = (status || "").toUpperCase();
    if (!VALID_ORDER_STATUSES.includes(upperStatus))
      throw new Error(`Invalid order status provided: ${status}`);

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order does not exist");

    if (order.orderStatus === upperStatus) return this.convertToResponse(order);

    order.orderStatus = upperStatus;
    await order.save();
    return this.convertToResponse(order);
  }
}

export default new OrderService();