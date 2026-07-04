'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/userController');

router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi')
], validate, ctrl.updateMe);
router.put('/me/avatar', authenticate, (req, res, next) => { req.uploadSubDir = 'avatars'; next(); }, upload.single('avatar'), ctrl.updateAvatar);
router.put('/me/password', authenticate, [
  body('current_password').notEmpty().withMessage('Password saat ini wajib diisi'),
  body('new_password').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
], validate, ctrl.changePassword);

// Admin
router.get('/', authenticate, requireAdmin, ctrl.getAllUsers);
router.get('/:id', authenticate, requireAdmin, ctrl.getUserById);
router.put('/:id/status', authenticate, requireAdmin, [
  body('is_active').isBoolean().withMessage('Status tidak valid')
], validate, ctrl.updateUserStatus);

module.exports = router;
