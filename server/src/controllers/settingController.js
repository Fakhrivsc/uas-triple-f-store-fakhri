'use strict';

const { Setting } = require('../models');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return res.json({ success: true, data: { settings: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Setting.upsert({ key, value: String(value) });
    }

    if (req.file) {
      await Setting.upsert({ key: 'store_logo', value: `/uploads/settings/${req.file.filename}` });
    }

    const settings = await Setting.findAll();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });

    return res.json({ success: true, message: 'Pengaturan berhasil disimpan', data: { settings: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
