// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// Auth endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/regenerate-qr/:userId", authController.regeneratePersonalQr); // protected in controller or middleware

export default router;
