// server.js
// Entry point: connects to MongoDB and starts the Express server

import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

// --- MongoDB connection ---
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Start the server only after DB is connected
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
  await import("mongoose").then(({ default: mongoose }) => mongoose.connection.close());
  console.log("🛑 MongoDB connection closed");
  process.exit(0);
});
