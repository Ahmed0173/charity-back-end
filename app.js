// app.js
// Configure and export the Express application

import dotenv from "dotenv";
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import apiRouter from "./routes/index.js";
import corsConfig from "./config/cors.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();

// --- Basic security & parsing ---
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Logging ---
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// --- Static files (QR codes, assets, etc.) ---
app.use("/public", express.static(path.join(__dirname, "public")));

// --- API routes ---
app.use("/api", apiRouter);

// --- Health check ---
app.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Not Found" });
});

// --- Centralized error handler ---
app.use(errorMiddleware); // <-- only one error handler

export default app;
