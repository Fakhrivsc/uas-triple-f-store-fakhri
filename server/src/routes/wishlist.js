'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/wishlistController');

router.get('/', authenticate, ctrl.getWishlist);
router.post('/:productId', authenticate, ctrl.addToWishlist);
router.delete('/:productId', authenticate, ctrl.removeFromWishlist);

module.exports = router;
