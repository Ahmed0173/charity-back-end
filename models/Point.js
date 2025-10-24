// models/Point.js
// Point = transaction / log of points earned or spent by a user
// activityType: event_attendance, volunteer_hour, renewal, share, manual
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PointSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    enum: ['event_attendance','volunteer_hour','renewal','share','manual'],
    required: true
  },
  points: { type: Number, required: true },
  description: { type: String },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' } // admin who awarded this point if any
}, { timestamps: true });

// After a point is created or removed, recalculate user's totalPoints and membershipLevel
PointSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const Point = mongoose.model('Point');
    const MembershipLevel = mongoose.model('MembershipLevel');

    // sum all points for the user
    const agg = await Point.aggregate([
      { $match: { user: doc.user } },
      { $group: { _id: '$user', total: { $sum: '$points' } } }
    ]);

    const totalPoints = (agg[0] && agg[0].total) ? agg[0].total : 0;

    // find matching membership level (minPoints <= totalPoints <= maxPoints OR maxPoints null)
    const level = await MembershipLevel.findOne({
      minPoints: { $lte: totalPoints },
      $or: [
        { maxPoints: { $gte: totalPoints } },
        { maxPoints: { $exists: false } },
        { maxPoints: null }
      ]
    }).sort({ minPoints: -1 }).exec();

    // update user
    const update = { totalPoints };
    if (level) {
      update.membershipLevel = level._id;
      update.cachedDiscountPercentage = level.discountPercentage || 0;
    } else {
      update.membershipLevel = null;
      update.cachedDiscountPercentage = 0;
    }

    await User.findByIdAndUpdate(doc.user, update).exec();
  } catch (err) {
    // log error but don't block operation
    console.error('Point post-save hook error:', err);
  }
});

PointSchema.post('remove', async function(doc) {
  // same logic as post-save to keep totals consistent when deleting
  try {
    const User = mongoose.model('User');
    const Point = mongoose.model('Point');
    const MembershipLevel = mongoose.model('MembershipLevel');

    const agg = await Point.aggregate([
      { $match: { user: doc.user } },
      { $group: { _id: '$user', total: { $sum: '$points' } } }
    ]);

    const totalPoints = (agg[0] && agg[0].total) ? agg[0].total : 0;

    const level = await MembershipLevel.findOne({
      minPoints: { $lte: totalPoints },
      $or: [
        { maxPoints: { $gte: totalPoints } },
        { maxPoints: { $exists: false } },
        { maxPoints: null }
      ]
    }).sort({ minPoints: -1 }).exec();

    const update = { totalPoints };
    if (level) {
      update.membershipLevel = level._id;
      update.cachedDiscountPercentage = level.discountPercentage || 0;
    } else {
      update.membershipLevel = null;
      update.cachedDiscountPercentage = 0;
    }

    await User.findByIdAndUpdate(doc.user, update).exec();
  } catch (err) {
    console.error('Point post-remove hook error:', err);
  }
});

export default mongoose.model('Point', PointSchema);
