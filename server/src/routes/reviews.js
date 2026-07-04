'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

router.get('/admin', authenticate, requireAdmin, ctrl.getAllReviews);
router.get('/product/:productId', ctrl.getProductReviews);
router.get('/eligibility/:productId', authenticate, ctrl.getReviewEligibility);
router.post('/', authenticate, [
  body('product_id').isInt().withMessage('Produk tidak valid'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5'),
  body('comment').optional().trim()
], validate, ctrl.createReview);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteReview);

module.exports = router;
