// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";
import User from "../models/User.js";

/**
 * Auth middleware: checks JWT token in Authorization header
 * Attach user to req.user if valid
 */
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ ok: false, message: "No token provided" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ ok: false, message: "Invalid token format" });

  const token = parts[1];

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(payload.id).select("-passwordHash").lean();
    if (!user)
      return res.status(401).json({ ok: false, message: "User not found" });

    req.user = user; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}
