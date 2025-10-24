// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const users = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected user endpoints
router.get('/me', authMiddleware, users.getProfile);
router.get('/', authMiddleware, users.list); // consider admin-only in controller
router.put('/:userId', authMiddleware, users.update);
router.delete('/:userId', authMiddleware, users.remove);
router.post('/:userId/generate-qr', authMiddleware, users.generatePersonalQr);

// Public profile by token (no auth)
router.get('/public/:token', users.publicViewByToken);

module.exports = router;
