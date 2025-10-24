// routes/index.js
// Central router that mounts all feature routers under logical paths
import express from "express";

// Import feature route modules (ESM)
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import levelRoutes from "./levelRoutes.js";
import eventRoutes from "./eventRoutes.js";
import eventQrRoutes from "./eventQrRoutes.js";
import pointRoutes from "./pointRoutes.js";
import discountRoutes from "./discountRoutes.js";

const router = express.Router();

// Mount routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/levels", levelRoutes);
router.use("/events", eventRoutes);
router.use("/event-qrs", eventQrRoutes);
router.use("/points", pointRoutes);
router.use("/discounts", discountRoutes);

// Export for ESM import
export default router;
