import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    restaurantLocation: {
      lat: { type: Number },
      lng: { type: Number }
    },
    deliveryRadiusKm: { type: Number, default: 10 },
    reviews: { type: [reviewSchema], default: [] },
    ratingAverage: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { collection: 'foods', timestamps: true }
);

export default mongoose.model('Food', foodSchema);
