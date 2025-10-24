// controllers/userController.js
// User CRUD and public profile for scanned QR (limited fields)
import User from '../models/User.js';
import MembershipLevel from '../models/MemberShipLevel.js';
import { v4 as uuidv4 } from 'uuid';

// helper to return public-safe user view
function publicUserView(userDoc, levelDoc = null) {
  return {
    fullName: userDoc.fullName,
    membershipNumber: userDoc.membershipNumber,
    levelName: levelDoc ? levelDoc.name : (userDoc.membershipLevel ? userDoc.membershipLevel : null),
    status: userDoc.status,
    discountPercentage: userDoc.cachedDiscountPercentage || 0,
    // no sensitive data here
  };
}

export default {
  // admin or user: get own profile
  async getProfile(req, res) {
    try {
      const id = req.user._id;
      const user = await User.findById(id).populate('membershipLevel').lean();
      if (!user) return res.status(404).json({ ok:false, message: 'User not found' });
      return res.json({ ok:true, user });
    } catch (err) {
      console.error('getProfile', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: list users with pagination/search
  async list(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (q) {
        filter.$or = [
          { fullName: { $regex: q, $options: 'i' } },
          { membershipNumber: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ];
      }
      const users = await User.find(filter)
        .skip((page-1)*limit)
        .limit(Number(limit))
        .populate('membershipLevel')
        .lean();
      const total = await User.countDocuments(filter);
      return res.json({ ok:true, users, total });
    } catch (err) {
      console.error('list users', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: update user
  async update(req, res) {
    try {
      const { userId } = req.params;
      const payload = req.body;
      // prevent changing protected fields unless admin
      delete payload.passwordHash;
      const user = await User.findByIdAndUpdate(userId, payload, { new: true }).populate('membershipLevel').lean();
      if (!user) return res.status(404).json({ ok:false, message: 'User not found' });
      return res.json({ ok:true, user });
    } catch (err) {
      console.error('update user', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: delete user
  async remove(req, res) {
    try {
      const { userId } = req.params;
      await User.findByIdAndDelete(userId);
      return res.json({ ok:true, message: 'deleted' });
    } catch (err) {
      console.error('delete user', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // public endpoint: view limited profile by personalQrToken
  async publicViewByToken(req, res) {
    try {
      const { token } = req.params; // route: GET /public/member/:token
      const user = await User.findOne({ personalQrToken: token }).populate('membershipLevel').lean();
      if (!user) return res.status(404).json({ ok:false, message: 'not found' });
      const level = user.membershipLevel;
      return res.json({ ok:true, profile: publicUserView(user, level) });
    } catch (err) {
      console.error('publicViewByToken', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: generate personal QR token and return URL (optionally store)
  async generatePersonalQr(req, res) {
    try {
      const { userId } = req.params;
      // check admin role
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });

      const token = uuidv4();
      await User.findByIdAndUpdate(userId, { personalQrToken: token });
      // return token — frontend can generate QR image using any library or service
      return res.json({ ok:true, token, publicUrl: `/public/member/${token}` });
    } catch (err) {
      console.error('generatePersonalQr', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
