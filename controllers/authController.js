// controllers/authController.js
// Authentication: register/login + helper to generate JWT
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXP = '7d';

module.exports = {
  // register a new member (admin can create members too)
  async register(req, res) {
    try {
      const { fullName, membershipNumber, phone, email, password } = req.body;
      if (!fullName || !membershipNumber || !phone || !password) {
        return res.status(400).json({ ok:false, message: 'missing required fields' });
      }

      const existing = await User.findOne({ $or: [{ membershipNumber }, { phone }, { email }] });
      if (existing) return res.status(409).json({ ok:false, message: 'User already exists' });

      const passwordHash = await bcrypt.hash(password, 10);
      const personalQrToken = uuidv4();

      const user = await User.create({
        fullName,
        membershipNumber,
        phone,
        email,
        passwordHash,
        personalQrToken
      });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXP });

      return res.json({ ok:true, user: { id: user._id, fullName: user.fullName }, token });
    } catch (err) {
      console.error('register error', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // login with phone or email
  async login(req, res) {
    try {
      const { identifier, password } = req.body; // identifier = phone or email or membershipNumber
      if (!identifier || !password) return res.status(400).json({ ok:false, message: 'missing credentials' });

      const user = await User.findOne({
        $or: [
          { phone: identifier },
          { email: identifier },
          { membershipNumber: identifier }
        ]
      });
      if (!user) return res.status(401).json({ ok:false, message: 'invalid credentials' });

      const match = await bcrypt.compare(password, user.passwordHash || '');
      if (!match) return res.status(401).json({ ok:false, message: 'invalid credentials' });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXP });
      return res.json({ ok:true, token, user: { id: user._id, fullName: user.fullName, role: user.role } });
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  },

  // admin: create personal qr token for a user (regenerate)
  async regeneratePersonalQr(req, res) {
    try {
      const { userId } = req.params;
      // only admin allowed; assume middleware checked role or check here
      if (!req.user || req.user.role !== 'admin') return res.status(403).json({ ok:false, message: 'forbidden' });

      const personalQrToken = uuidv4();
      await User.findByIdAndUpdate(userId, { personalQrToken });
      return res.json({ ok:true, personalQrToken });
    } catch (err) {
      console.error('regeneratePersonalQr', err);
      return res.status(500).json({ ok:false, message: 'server error' });
    }
  }
};
