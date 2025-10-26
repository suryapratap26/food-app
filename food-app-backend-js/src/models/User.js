import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' }
  },
  { collection: 'users', timestamps: true }
);

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

export default mongoose.model('User', userSchema);
