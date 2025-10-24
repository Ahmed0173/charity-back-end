// middlewares/roleMiddleware.js

/**
 * Role middleware: restrict route access to specific roles
 * @param {Array} roles - allowed roles, e.g., ['admin']
 */
export default function roleMiddleware(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ ok: false, message: "Forbidden" });
    next();
  };
}
