'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/shipmentController');

router.get('/options', ctrl.getShippingOptions);
router.get('/:orderId', authenticate, ctrl.getShipment);
router.put('/:orderId', authenticate, requireAdmin, ctrl.createOrUpdateShipment);
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['waiting', 'picked_up', 'in_transit', 'delivered']).withMessage('Status tidak valid')
], validate, ctrl.updateShipmentStatus);

module.exports = router;
