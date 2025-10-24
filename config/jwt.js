// config/jwt.js
export default {
  secret: process.env.JWT_SECRET || "default_secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
