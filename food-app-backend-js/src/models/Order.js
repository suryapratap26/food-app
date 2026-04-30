import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: true },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, required: true },
    category: { type: String },
    imageUrl: { type: String },
    description: { type: String }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    userAddress: { type: String, required: true },
    customerAddress: {
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String },
      line1: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipcode: { type: String }
    },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    orderItemsList: [orderItemSchema],
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'CARD' },
    paymentStatus: { type: String, default: 'INITIATED' },
    orderStatus: { type: String, default: 'INITIATED' },
    restaurantClaimStatus: { type: String, default: 'UNCLAIMED' },
    restaurantClaimedAt: { type: Date },
    restaurantClaimBatchId: { type: String },
    restaurantGrossAmount: { type: Number },
    platformFeeAmount: { type: Number },
    restaurantNetAmount: { type: Number },
    stripePaymentIntentId: { type: String, index: true, sparse: true },
    stripeClientSecret: { type: String }
  },
  { timestamps: true }
);

orderSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};
orderSchema.statics.findByRestaurantId = function (restaurantId) {
  return this.find({ restaurantId }).sort({ createdAt: -1 });
};
orderSchema.statics.findByStripePaymentIntentId = function (paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId });
};

export default mongoose.model('Order', orderSchema);
