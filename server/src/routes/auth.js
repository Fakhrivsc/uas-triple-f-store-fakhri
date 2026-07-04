'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { success: false, message: 'Terlalu banyak percobaan, coba lagi nanti' } });

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('phone').optional().isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('confirm_password').custom((val, { req }) => val === req.body.password).withMessage('Konfirmasi password tidak cocok')
], validate, ctrl.register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi')
], validate, ctrl.login);

router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);

module.exports = router;
