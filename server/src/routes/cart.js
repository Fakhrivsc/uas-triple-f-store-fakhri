'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.get('/', authenticate, ctrl.getCart);
router.post('/', authenticate, [
  body('product_id').isInt().withMessage('Produk tidak valid'),
  body('quantity').isInt({ min: 1 }).withMessage('Jumlah minimal 1')
], validate, ctrl.addToCart);
router.post('/merge', authenticate, ctrl.mergeCart);
router.put('/:itemId', authenticate, [
  body('quantity').isInt({ min: 0 }).withMessage('Jumlah tidak valid')
], validate, ctrl.updateCartItem);
router.delete('/clear', authenticate, ctrl.clearCart);
router.delete('/:itemId', authenticate, ctrl.removeCartItem);

module.exports = router;
