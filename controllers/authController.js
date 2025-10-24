// controllers/authController.js
// Authentication: register/login + helper to generate JWT

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import jwtConfig from "../config/jwt.js";

/**
 * Helper to generate JWT token for a user
 * @param {Object} user - user object from DB
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const authController = {
  // -----------------------------
  // Register a new member
  // -----------------------------
  async register(req, res) {
    try {
      const { fullName, membershipNumber, phone, email, password } = req.body;
      if (!fullName || !membershipNumber || !phone || !password) {
        return res
          .status(400)
          .json({ ok: false, message: "Missing required fields" });
      }

      const existing = await User.findOne({
        $or: [{ membershipNumber }, { phone }, { email }],
      });
      if (existing)
        return res
          .status(409)
          .json({ ok: false, message: "User already exists" });

      const passwordHash = await bcrypt.hash(password, 10);
      const personalQrToken = uuidv4();

      const user = await User.create({
        fullName,
        membershipNumber,
        phone,
        email,
        passwordHash,
        personalQrToken,
      });

      const token = generateToken(user);

      return res.json({
        ok: true,
        user: { id: user._id, fullName: user.fullName },
        token,
      });
    } catch (err) {
      console.error("register error", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  },

  // -----------------------------
  // Login with phone, email, or membership number
  // -----------------------------
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ ok: false, message: "Missing email or password" });

      const user = await User.findOne({ email });

      if (!user)
        return res.status(401).json({ ok: false, message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.passwordHash || "");
      if (!match)
        return res.status(401).json({ ok: false, message: "Invalid credentials" });

      const token = generateToken(user);

      return res.json({
        ok: true,
        token,
        user: { id: user._id, fullName: user.fullName, role: user.role },
      });
    } catch (err) {
      console.error("login error", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  },

  // -----------------------------
  // Admin: regenerate personal QR token for a user
  // -----------------------------
  async regeneratePersonalQr(req, res) {
    try {
      const { userId } = req.params;

      // Only admin allowed
      if (!req.user || req.user.role !== "admin")
        return res.status(403).json({ ok: false, message: "Forbidden" });

      const personalQrToken = uuidv4();
      await User.findByIdAndUpdate(userId, { personalQrToken });

      return res.json({ ok: true, personalQrToken });
    } catch (err) {
      console.error("regeneratePersonalQr error", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  },
};
