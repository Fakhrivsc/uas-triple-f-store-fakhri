'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getCategories);
router.post('/', authenticate, requireAdmin,
  (req, res, next) => { req.uploadSubDir = 'categories'; next(); },
  upload.single('image'),
  [body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi')],
  validate, ctrl.createCategory
);
router.put('/:id', authenticate, requireAdmin,
  (req, res, next) => { req.uploadSubDir = 'categories'; next(); },
  upload.single('image'),
  validate, ctrl.updateCategory
);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteCategory);

module.exports = router;
