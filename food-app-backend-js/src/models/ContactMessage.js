import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    deliveryStatus: {
      type: String,
      enum: ["STORED_ONLY", "EMAILED"],
      default: "STORED_ONLY",
    },
  },
  { timestamps: true, collection: "contact_messages" }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
