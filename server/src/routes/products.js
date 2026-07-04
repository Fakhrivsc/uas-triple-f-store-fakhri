'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productController');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) return authenticate(req, res, next);
  next();
};

router.get('/', optionalAuth, ctrl.getProducts);
router.get('/:slug', ctrl.getProductBySlug);

router.post('/', authenticate, requireAdmin,
  (req, res, next) => { req.uploadSubDir = 'products'; next(); },
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Nama produk wajib diisi'),
    body('category_id').isInt().withMessage('Kategori wajib dipilih'),
    body('price').isFloat({ min: 0 }).withMessage('Harga tidak valid'),
    body('stock').isInt({ min: 0 }).withMessage('Stok tidak valid'),
    body('weight_gram').isInt({ min: 1 }).withMessage('Berat tidak valid')
  ],
  validate, ctrl.createProduct
);

router.put('/bulk/status', authenticate, requireAdmin, ctrl.bulkUpdateStatus);

router.put('/:id', authenticate, requireAdmin,
  (req, res, next) => { req.uploadSubDir = 'products'; next(); },
  upload.array('images', 5),
  validate, ctrl.updateProduct
);

router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

module.exports = router;
