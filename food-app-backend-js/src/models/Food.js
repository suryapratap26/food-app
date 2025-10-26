import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String }
  },
  { collection: 'foods', timestamps: true }
);

export default mongoose.model('Food', foodSchema);
