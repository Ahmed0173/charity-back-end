// controllers/discountController.js
// Manage discounts/offers and verify member eligibility when merchant scans member QR
import Discount from '../models/Discount.js';
import User from '../models/User.js';
import MembershipLevel from '../models/MemberShipLevel.js';

export default {
  // create offer (admin)
  async create(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });
      const payload = req.body;
      const d = await Discount.create(payload);
      return res.json({ ok:true, discount: d });
    } catch (err) {
      console.error('create discount', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // list active discounts (public or for member)
  async list(req, res) {
    try {
      const now = new Date();
      const discounts = await Discount.find({
        active: true,
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: { $lte: now } }
        ],
        $or: [
          { validTo: { $exists: false } },
          { validTo: { $gte: now } }
        ]
      }).populate('membershipLevel').lean();
      return res.json({ ok:true, discounts });
    } catch (err) {
      console.error('list discounts', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // merchant scans member QR to verify discount (public verify endpoint)
  // payload: { memberToken, discountId } -> returns whether eligible and percent
  async verifyDiscount(req, res) {
    try {
      const { memberToken, discountId } = req.body;
      if (!memberToken || !discountId) return res.status(400).json({ ok:false, message: 'missing fields' });

      const user = await User.findOne({ personalQrToken: memberToken }).populate('membershipLevel').lean();
      if (!user) return res.status(404).json({ ok:false, message: 'member not found' });

      const discount = await Discount.findById(discountId).populate('membershipLevel').lean();
      if (!discount) return res.status(404).json({ ok:false, message: 'discount not found' });
      if (!discount.active) return res.status(400).json({ ok:false, message: 'discount inactive' });

      const now = new Date();
      if (discount.validFrom && discount.validFrom > now) return res.status(400).json({ ok:false, message: 'discount not started' });
      if (discount.validTo && discount.validTo < now) return res.status(400).json({ ok:false, message: 'discount expired' });

      // check membership level eligibility
      if (discount.membershipLevel) {
        // member level id must match or be higher/equal depending on policy; here we check exact or compare by minPoints
        const requiredLevel = await MembershipLevel.findById(discount.membershipLevel).lean();
        const memberLevel = user.membershipLevel; // populated above, might be id or doc
        if (!memberLevel) return res.json({ ok:true, eligible: false, reason: 'member has no level' });

        // simplest policy: check if member's level discountPercentage >= required's minPoints OR check by minPoints
        // We'll compare levels by minPoints if both are populated
        const requiredMin = requiredLevel.minPoints || 0;
        const memberMin = (user.membershipLevel && user.membershipLevel.minPoints) ? user.membershipLevel.minPoints : 0;

        if (memberMin < requiredMin) {
          return res.json({ ok:true, eligible: false, reason: 'insufficient level' });
        }
      }

      // eligible
      return res.json({
        ok:true,
        eligible: true,
        discount: { percent: discount.percent, title: discount.title, merchantName: discount.merchantName }
      });
    } catch (err) {
      console.error('verifyDiscount', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
