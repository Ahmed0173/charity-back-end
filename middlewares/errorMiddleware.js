// middlewares/errorMiddleware.js
export default function errorMiddleware(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" ? "Server error" : err.message;
  res.status(status).json({ ok: false, message });
}
