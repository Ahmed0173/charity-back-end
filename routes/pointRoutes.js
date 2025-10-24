// routes/pointRoutes.js
import express from 'express';
import points from '../controllers/pointController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// list for self or admin can pass userId
router.get('/user/:userId?', authMiddleware, points.listForUser);
router.post('/award', authMiddleware, points.award);
router.delete('/:id', authMiddleware, points.remove);

export default router;
