'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/addressController');

const addressValidation = [
  body('label').trim().notEmpty().withMessage('Label alamat wajib diisi'),
  body('recipient_name').trim().notEmpty().withMessage('Nama penerima wajib diisi'),
  body('phone').notEmpty().withMessage('Nomor telepon wajib diisi'),
  body('province').trim().notEmpty().withMessage('Provinsi wajib diisi'),
  body('city').trim().notEmpty().withMessage('Kota wajib diisi'),
  body('district').trim().notEmpty().withMessage('Kecamatan wajib diisi'),
  body('postal_code').trim().notEmpty().withMessage('Kode pos wajib diisi'),
  body('full_address').trim().notEmpty().withMessage('Alamat lengkap wajib diisi')
];

router.get('/', authenticate, ctrl.getAddresses);
router.post('/', authenticate, addressValidation, validate, ctrl.createAddress);
router.put('/:id', authenticate, addressValidation, validate, ctrl.updateAddress);
router.delete('/:id', authenticate, ctrl.deleteAddress);
router.put('/:id/default', authenticate, ctrl.setDefaultAddress);

module.exports = router;
