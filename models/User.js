// models/User.js
// User model: member account and profile info
// NOTE: store passwords hashed (bcrypt) in `passwordHash` if you use auth
import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  membershipNumber: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  nationalId: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String }, // hashed password
  joinDate: { type: Date, default: Date.now },
  lastRenewal: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' },
  totalPoints: { type: Number, default: 0 },
  membershipLevel: { type: Schema.Types.ObjectId, ref: 'MembershipLevel', default: null },
  cachedDiscountPercentage: { type: Number, default: 0 }, // cached for quick display
  personalQrToken: { type: String, unique: true, sparse: true }, // token encoded in member QR (public)
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

// Export as default for ESM
const User = mongoose.model('User', UserSchema);
export default User;
