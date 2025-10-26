import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

cartSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};
cartSchema.statics.deleteByUserId = function (userId) {
  return this.deleteOne({ userId });
};

export default mongoose.model('Cart', cartSchema);
