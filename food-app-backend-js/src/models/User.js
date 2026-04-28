import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'IN' },
    zipcode: { type: String, trim: true }
  },
  { _id: false }
);

const geoPointSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN', 'RESTAURANT'],
      default: 'CUSTOMER'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'REJECTED'],
      default: 'ACTIVE'
    },
    phoneNumber: { type: String, trim: true },
    location: geoPointSchema,
    savedAddress: addressSchema,
    restaurantProfile: {
      restaurantName: { type: String, trim: true },
      address: addressSchema,
      location: geoPointSchema,
      deliveryRadiusKm: { type: Number, default: 10 }
    }
  },
  { collection: 'users', timestamps: true }
);

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

export default mongoose.model('User', userSchema);
