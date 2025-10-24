// models/Discount.js
// Discount: offers or deals tied to membership levels or globally.
// Merchants can verify by scanning member QR and checking member's level/discount.
import mongoose from 'mongoose';
const { Schema } = mongoose;

const DiscountSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  membershipLevel: { type: Schema.Types.ObjectId, ref: 'MembershipLevel' }, // required level to access, nullable for all
  percent: { type: Number, required: true },
  merchantName: { type: String },
  qrToken: { type: String, unique: true, sparse: true }, // optional token for merchant scanning/verifying
  active: { type: Boolean, default: true },
  validFrom: { type: Date },
  validTo: { type: Date }
}, { timestamps: true });

// helper to check if discount currently valid
DiscountSchema.methods.isValidNow = function() {
  const now = new Date();
  if (!this.active) return false;
  if (this.validFrom && this.validFrom > now) return false;
  if (this.validTo && this.validTo < now) return false;
  return true;
};

export default mongoose.model('Discount', DiscountSchema);
