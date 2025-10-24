// routes/levelRoutes.js
const express = require('express');
const router = express.Router();
const levels = require('../controllers/membershipLevelController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, levels.create);
router.get('/', levels.list);
router.put('/:id', authMiddleware, levels.update);
router.delete('/:id', authMiddleware, levels.remove);

module.exports = router;
