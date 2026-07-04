'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', authenticate, [
  body('address_id').isInt().withMessage('Alamat wajib dipilih'),
  body('items').isArray({ min: 1 }).withMessage('Keranjang tidak boleh kosong'),
  body('courier').notEmpty().withMessage('Kurir wajib dipilih'),
  body('service_type').notEmpty().withMessage('Layanan pengiriman wajib dipilih'),
  body('payment_method').notEmpty().withMessage('Metode pembayaran wajib dipilih')
], validate, ctrl.createOrder);

router.get('/mine', authenticate, ctrl.getMyOrders);
router.get('/admin', authenticate, requireAdmin, ctrl.getAllOrders);
router.get('/:id', authenticate, ctrl.getOrderById);
router.put('/:id/cancel', authenticate, ctrl.cancelOrder);
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').notEmpty().withMessage('Status wajib diisi')
], validate, ctrl.updateOrderStatus);
// PATCH alias — same handler
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').notEmpty().withMessage('Status wajib diisi')
], validate, ctrl.updateOrderStatus);

module.exports = router;
