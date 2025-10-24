// routes/eventQrRoutes.js
const express = require('express');
const router = express.Router();
const eventQr = require('../controllers/eventQrController');
const authMiddleware = require('../middlewares/authMiddleware');

// Admin: create tokens
router.post('/', authMiddleware, eventQr.createToken);
router.get('/event/:eventId', authMiddleware, eventQr.listForEvent);
router.post('/scan', authMiddleware, eventQr.scanAttendance);
router.post('/invalidate/:id', authMiddleware, eventQr.invalidate);

module.exports = router;
