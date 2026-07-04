'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/shippingController');

// Public endpoints — no auth needed for province/city lookups
router.get('/provinces', ctrl.getProvinces);
router.get('/cities/:provinceId', ctrl.getCities);
router.post('/cost', ctrl.getCost);

module.exports = router;
