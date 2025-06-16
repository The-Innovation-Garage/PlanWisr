import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, unique:true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  aiLimit: { type: Number, default: 10 }, // Default AI limit
  isPro: { type: Boolean, default: false }, // Pro status
  subscriptionStatus: { type: String, default: "inactive" }, // Subscription status (active, cancelled, refunded, etc.)
  subscriptionId: { type: String, default: null }, // Subscription ID for Pro users
  companyDetails: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
    logoUrl: { type: String, default: "" }
  }
}, { timestamps: true });



mongoose.models = {}

export default mongoose.model("User", userSchema);