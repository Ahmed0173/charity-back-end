// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const events = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, events.create);
router.get('/', events.list);
router.get('/:id', events.get);
router.put('/:id', authMiddleware, events.update);
router.delete('/:id', authMiddleware, events.remove);

module.exports = router;
