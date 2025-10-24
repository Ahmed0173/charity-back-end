// routes/discountRoutes.js
import express from 'express';
import discounts from '../controllers/discountController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, discounts.create);
router.get('/', discounts.list);
router.post('/verify', discounts.verifyDiscount);

export default router;
