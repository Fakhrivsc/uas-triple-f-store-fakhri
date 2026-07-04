'use strict';

const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.get('/summary', authenticate, requireAdmin, ctrl.getSummary);
router.get('/chart', authenticate, requireAdmin, ctrl.getRevenueChart);
router.get('/top-products', authenticate, requireAdmin, ctrl.getTopProducts);

module.exports = router;
