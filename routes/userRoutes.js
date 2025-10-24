// routes/userRoutes.js
import express from "express";
import usersController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected user endpoints
router.get("/me", authMiddleware, usersController.getProfile);
router.get("/", authMiddleware, usersController.list); // admin-only check in controller
router.put("/:userId", authMiddleware, usersController.update);
router.delete("/:userId", authMiddleware, usersController.remove);
router.post("/:userId/generate-qr", authMiddleware, usersController.generatePersonalQr);

// Public profile by token (no auth)
router.get("/public/:token", usersController.publicViewByToken);

export default router;
