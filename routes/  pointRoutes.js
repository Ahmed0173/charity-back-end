// routes/pointRoutes.js
const express = require('express');
const router = express.Router();
const points = require('../controllers/pointController');
const authMiddleware = require('../middlewares/authMiddleware');

// list for self or admin can pass userId
router.get('/user/:userId?', authMiddleware, points.listForUser);
router.post('/award', authMiddleware, points.award);
router.delete('/:id', authMiddleware, points.remove);

module.exports = router;
