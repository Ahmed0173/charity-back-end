// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/regenerate-qr/:userId', auth.regeneratePersonalQr); // protect in controller or via middleware

module.exports = router;
