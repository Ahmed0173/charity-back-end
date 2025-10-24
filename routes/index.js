// routes/index.js
// Central router that mounts all feature routers under logical paths
const express = require('express');
const router = express.Router();

// Import feature route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const levelRoutes = require('./levelRoutes');
const eventRoutes = require('./eventRoutes');
const eventQrRoutes = require('./eventQrRoutes');
const pointRoutes = require('./pointRoutes');
const discountRoutes = require('./discountRoutes');

// Mount routers:
// Auth routes (e.g., POST /api/auth/register, POST /api/auth/login)
router.use('/auth', authRoutes);

// Users routes (e.g., GET /api/users/me, GET /api/users/public/:token)
router.use('/users', userRoutes);

// Membership levels (e.g., GET /api/levels)
router.use('/levels', levelRoutes);

// Events CRUD (e.g., GET /api/events, POST /api/events)
router.use('/events', eventRoutes);

// Event QR management & scanning (e.g., POST /api/event-qrs/scan)
router.use('/event-qrs', eventQrRoutes);

// Points ledger (e.g., GET /api/points/user/:userId)
router.use('/points', pointRoutes);

// Discounts and verification (e.g., POST /api/discounts/verify)
router.use('/discounts', discountRoutes);

module.exports = router;
