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
    userAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    orderItemsList: [orderItemSchema],
    amount: { type: Number, required: true },
    paymentStatus: { type: String, default: 'INITIATED' },
    orderStatus: { type: String, default: 'INITIATED' },
    stripePaymentIntentId: { type: String, index: true, sparse: true },
    stripeClientSecret: { type: String }
  },
  { timestamps: true }
);

orderSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};
orderSchema.statics.findByStripePaymentIntentId = function (paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId });
};

export default mongoose.model('Order', orderSchema);
