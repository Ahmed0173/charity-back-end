import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ ok:false, message: "No token provided" });

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ ok:false, message: "Invalid token format" });

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(payload.id).select("-passwordHash").lean();
    if (!user) return res.status(401).json({ ok:false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok:false, message: "Invalid token" });
  }
}
