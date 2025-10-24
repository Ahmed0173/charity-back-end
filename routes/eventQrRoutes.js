// routes/eventQrRoutes.js
import express from 'express';
import eventQr from '../controllers/eventQrController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin: create tokens
router.post('/', authMiddleware, eventQr.createToken);
router.get('/event/:eventId', authMiddleware, eventQr.listForEvent);
router.post('/scan', authMiddleware, eventQr.scanAttendance);
router.post('/invalidate/:id', authMiddleware, eventQr.invalidate);

export default router;
