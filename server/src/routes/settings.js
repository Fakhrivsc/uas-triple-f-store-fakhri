'use strict';

const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/settingController');

router.get('/', ctrl.getSettings);
router.put('/', authenticate, requireAdmin,
  (req, res, next) => { req.uploadSubDir = 'settings'; next(); },
  upload.single('logo'), ctrl.updateSettings
);

module.exports = router;
