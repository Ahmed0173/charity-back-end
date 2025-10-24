// routes/discountRoutes.js
const express = require('express');
const router = express.Router();
const discounts = require('../controllers/discountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, discounts.create);
router.get('/', discounts.list);
router.post('/verify', discounts.verifyDiscount);

module.exports = router;
