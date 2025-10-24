// routes/eventRoutes.js
import express from 'express';
import events from '../controllers/eventController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, events.create);
router.get('/', events.list);
router.get('/:id', events.get);
router.put('/:id', authMiddleware, events.update);
router.delete('/:id', authMiddleware, events.remove);

export default router;
