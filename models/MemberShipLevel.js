// models/MembershipLevel.js
// MembershipLevel defines ranges and benefits for levels (e.g., Bronze/Silver/Gold/Platinum)
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MembershipLevelSchema = new Schema({
  name: { type: String, required: true }, // Bronze, Silver, ...
  minPoints: { type: Number, required: true },
  maxPoints: { type: Number }, // null/undefined = open-ended
  discountPercentage: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

// Add an index to speed range queries (optional)
MembershipLevelSchema.index({ minPoints: 1, maxPoints: 1 });

export default mongoose.model('MembershipLevel', MembershipLevelSchema);
