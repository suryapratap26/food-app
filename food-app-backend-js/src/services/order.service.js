import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Food from "../models/Food.js";
import User from "../models/User.js";
import Stripe from "stripe";
import { randomUUID } from "crypto";

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
const PLATFORM_FEE_RATE = 0.1;

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

class OrderService {
  // Helpers
  normalizeAddress(address = {}) {
    return {
      firstName: address.firstName?.trim() || '',
      lastName: address.lastName?.trim() || '',
      phone: address.phone?.trim() || '',
      line1: address.line1?.trim() || '',
      city: address.city?.trim() || '',
      state: address.state?.trim() || '',
      country: address.country?.trim() || 'IN',
      zipcode: address.zipcode?.trim() || ''
    };
  }

  formatAddress(address = {}) {
    return [
      `${address.firstName || ''} ${address.lastName || ''}`.trim(),
      address.line1,
      address.city,
      address.state,
      address.country,
      address.zipcode
    ]
      .filter(Boolean)
      .join(', ');
  }

  isRestaurantPayoutEligible(order) {
    const isPaidOrder =
      order.paymentStatus === "SUCCESS" || order.paymentMethod === "COD";
    return isPaidOrder && order.orderStatus === "DELIVERED";
  }

  calculateRestaurantPayout(amount) {
    const grossAmount = roundCurrency(amount);
    const platformFeeAmount = roundCurrency(grossAmount * PLATFORM_FEE_RATE);
    const netAmount = roundCurrency(grossAmount - platformFeeAmount);

    return {
      grossAmount,
      platformFeeAmount,
      netAmount,
    };
  }

  summarizeRestaurantOrders(orders = []) {
    return orders.reduce(
      (summary, order) => {
        const payout = this.calculateRestaurantPayout(order.amount);
        return {
          ordersCount: summary.ordersCount + 1,
          grossAmount: roundCurrency(summary.grossAmount + payout.grossAmount),
          platformFeeAmount: roundCurrency(
            summary.platformFeeAmount + payout.platformFeeAmount
          ),
          netAmount: roundCurrency(summary.netAmount + payout.netAmount),
        };
      },
      {
        ordersCount: 0,
        grossAmount: 0,
        platformFeeAmount: 0,
        netAmount: 0,
      }
    );
  }

  async buildOrderContext(orderRequest, user) {
    const foodIds = (orderRequest.orderItems || []).map((item) => item.foodId);
    const foods = await Food.find({ _id: { $in: foodIds } });
    if (!foods.length) {
      throw new Error('No valid food items found for this order.');
    }

    const restaurantIds = [...new Set(foods.map((food) => food.restaurantId))];
    if (restaurantIds.length !== 1) {
      throw new Error('Please place one restaurant order at a time.');
    }

    const restaurantId = restaurantIds[0];
    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== 'RESTAURANT') {
      throw new Error('Restaurant for this order no longer exists.');
    }

    const savedAddress = orderRequest.customerAddress
      ? this.normalizeAddress(orderRequest.customerAddress)
      : user.savedAddress
      ? this.normalizeAddress(user.savedAddress)
      : null;

    if (!savedAddress?.line1 || !savedAddress?.city) {
      throw new Error('Please save your delivery address before placing the order.');
    }

    const phoneNumber =
      orderRequest.phoneNumber?.trim() ||
      savedAddress.phone ||
      user.phoneNumber ||
      '';

    if (!phoneNumber) {
      throw new Error('Phone number is required.');
    }

    return {
      restaurantId,
      restaurantName:
        restaurant.restaurantProfile?.restaurantName || restaurant.name,
      customerAddress: savedAddress,
      userAddress: this.formatAddress(savedAddress),
      phoneNumber,
      email: orderRequest.email?.trim() || user.email
    };
  }

  convertToEntity(orderRequest, userId, orderContext) {
    const paymentMethod =
      (orderRequest.paymentMethod || "CARD").toUpperCase() === "COD"
        ? "COD"
        : "CARD";

    return new Order({
      userId,
      restaurantId: orderContext.restaurantId,
      restaurantName: orderContext.restaurantName,
      userAddress: orderContext.userAddress,
      customerAddress: orderContext.customerAddress,
      amount: orderRequest.amount,
      orderItemsList: orderRequest.orderItems || [],
      phoneNumber: orderContext.phoneNumber,
      email: orderContext.email,
      paymentMethod,
      paymentStatus: "PENDING_INTENT_CREATION",
      orderStatus: "INITIATED",
    });
  }

  convertToResponse(order) {
    return {
      id: order._id.toString(),
      userId: order.userId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      userAddress: order.userAddress,
      customerAddress: order.customerAddress || null,
      phoneNumber: order.phoneNumber,
      email: order.email,
      amount: order.amount,
      paymentMethod: order.paymentMethod || "CARD",
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      restaurantClaimStatus: order.restaurantClaimStatus || "UNCLAIMED",
      restaurantClaimedAt: order.restaurantClaimedAt || null,
      restaurantClaimBatchId: order.restaurantClaimBatchId || null,
      restaurantGrossAmount: order.restaurantGrossAmount ?? null,
      platformFeeAmount: order.platformFeeAmount ?? null,
      restaurantNetAmount: order.restaurantNetAmount ?? null,
      orderedItems: order.orderItemsList || [],
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeClientSecret: order.stripeClientSecret,
      createdAt: order.createdAt,
    };
  }

  // Core methods
  async createOrderWithPayment(request, user) {
    const orderContext = await this.buildOrderContext(request, user);

    if (user.role === 'CUSTOMER') {
      user.savedAddress = orderContext.customerAddress;
      user.phoneNumber = orderContext.phoneNumber;
      await user.save();
    }

    let order = this.convertToEntity(request, user._id.toString(), orderContext);
    order = await order.save();

    if (order.paymentMethod === "COD") {
      order.paymentStatus = "PENDING_COD";
      order.orderStatus = "PLACED";
      order = await order.save();
      return this.convertToResponse(order);
    }

    try {
      // ==========================================================
      // ✅ CHANGE 2: Get the lazily initialized client here
      const stripe = getStripeClient(); 
      // ==========================================================
      
      const amountInSmallestUnit = Math.round(order.amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({ // Use the local 'stripe' variable
        amount: amountInSmallestUnit,
        currency: "inr",
        metadata: {
          order_id: order._id.toString(),
          user_id: user._id.toString(),
          restaurant_id: order.restaurantId
        },
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

  async removeOrder(orderId, actor) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order does not exist");

    const actorId = actor?._id?.toString();
    const canDelete =
      actor?.role === "ADMIN" ||
      order.userId === actorId ||
      (actor?.role === "RESTAURANT" && order.restaurantId === actorId);

    if (!canDelete) {
      throw new Error("You do not have permission to delete this order.");
    }

    await Order.findByIdAndDelete(orderId);
  }

  async getOrdersOfAllUsers(actor) {
    const list =
      actor?.role === 'RESTAURANT'
        ? await Order.findByRestaurantId(actor._id.toString())
        : await Order.find({}).sort({ createdAt: -1 });
    return list.map((o) => this.convertToResponse(o));
  }

  async getRestaurantEarningsSummary(actor) {
    if (actor?.role !== "RESTAURANT") {
      throw new Error("Only restaurants can view payout summary.");
    }

    const restaurantId = actor._id.toString();
    const orders = await Order.findByRestaurantId(restaurantId);
    const eligibleOrders = orders.filter((order) =>
      this.isRestaurantPayoutEligible(order)
    );
    const claimableOrders = eligibleOrders.filter(
      (order) => order.restaurantClaimStatus !== "CLAIMED"
    );
    const claimedOrders = eligibleOrders.filter(
      (order) => order.restaurantClaimStatus === "CLAIMED"
    );
    const lastClaimedAt =
      claimedOrders
        .map((order) => order.restaurantClaimedAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || null;

    return {
      platformFeeRate: PLATFORM_FEE_RATE,
      claimable: this.summarizeRestaurantOrders(claimableOrders),
      claimed: this.summarizeRestaurantOrders(claimedOrders),
      overall: this.summarizeRestaurantOrders(eligibleOrders),
      lastClaimedAt,
    };
  }

  async claimRestaurantEarnings(actor) {
    if (actor?.role !== "RESTAURANT") {
      throw new Error("Only restaurants can claim earnings.");
    }

    const restaurantId = actor._id.toString();
    const orders = await Order.findByRestaurantId(restaurantId);
    const claimableOrders = orders.filter(
      (order) =>
        this.isRestaurantPayoutEligible(order) &&
        order.restaurantClaimStatus !== "CLAIMED"
    );

    if (!claimableOrders.length) {
      throw new Error("No delivered earnings are available to claim right now.");
    }

    const claimedAt = new Date();
    const claimBatchId = randomUUID();

    await Promise.all(
      claimableOrders.map(async (order) => {
        const payout = this.calculateRestaurantPayout(order.amount);
        order.restaurantClaimStatus = "CLAIMED";
        order.restaurantClaimedAt = claimedAt;
        order.restaurantClaimBatchId = claimBatchId;
        order.restaurantGrossAmount = payout.grossAmount;
        order.platformFeeAmount = payout.platformFeeAmount;
        order.restaurantNetAmount = payout.netAmount;
        await order.save();
      })
    );

    return {
      claimBatchId,
      claimedAt,
      platformFeeRate: PLATFORM_FEE_RATE,
      ...this.summarizeRestaurantOrders(claimableOrders),
    };
  }

  async updateOrder(orderId, status, actor) {
    const upperStatus = (status || "").toUpperCase();
    if (!VALID_ORDER_STATUSES.includes(upperStatus))
      throw new Error(`Invalid order status provided: ${status}`);

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order does not exist");
    if (
      actor?.role === 'RESTAURANT' &&
      order.restaurantId !== actor._id.toString()
    ) {
      throw new Error('You can only update orders placed for your restaurant.');
    }

    if (order.orderStatus === upperStatus) return this.convertToResponse(order);

    order.orderStatus = upperStatus;
    await order.save();
    return this.convertToResponse(order);
  }
}

export default new OrderService();
