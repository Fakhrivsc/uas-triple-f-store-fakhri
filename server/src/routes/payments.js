'use strict';

const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/paymentController');

// Midtrans
router.post('/create-transaction', authenticate, ctrl.createMidtransTransaction);
router.post('/notification', ctrl.handleMidtransNotification); // public — called by Midtrans server

// Admin
router.get('/admin', authenticate, requireAdmin, ctrl.getAllPayments);

// User
router.get('/:orderId', authenticate, ctrl.getPaymentByOrder);
router.put('/:id/upload-proof', authenticate,
  (req, res, next) => { req.uploadSubDir = 'payments'; next(); },
  upload.single('proof'), ctrl.uploadProof
);
router.put('/:id/confirm', authenticate, requireAdmin, ctrl.confirmPayment);
router.put('/:id/reject', authenticate, requireAdmin, ctrl.rejectPayment);
router.put('/:id/refund', authenticate, requireAdmin, ctrl.refundPayment);

module.exports = router;
