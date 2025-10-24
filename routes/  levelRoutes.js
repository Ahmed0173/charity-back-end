// routes/levelRoutes.js
import express from "express";
import levelsController from "../controllers/membershipLevelController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// CRUD for membership levels
router.post("/", authMiddleware, levelsController.create);
router.get("/", levelsController.list);
router.put("/:id", authMiddleware, levelsController.update);
router.delete("/:id", authMiddleware, levelsController.remove);

export default router;
