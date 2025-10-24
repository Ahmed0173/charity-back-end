// models/EventQr.js
// EventQr: a generated QR token for event attendance or check-in.
// Admins can create tokens; each token can have expiry/max uses.
import mongoose from 'mongoose';
const { Schema } = mongoose;

const EventQrSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  token: { type: String, required: true, unique: true }, // token encoded in QR
  qrUrl: { type: String }, // optional stored QR image URL
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin who created it
  expiresAt: { type: Date },
  maxUses: { type: Number }, // optional limit
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

// convenience method to validate token usable state
EventQrSchema.methods.isUsable = function() {
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  return true;
};

export default mongoose.model('EventQr', EventQrSchema);
