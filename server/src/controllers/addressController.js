'use strict';

const { UserAddress } = require('../models');

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });
    return res.json({ success: true, data: { addresses } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { label, recipient_name, phone, province_id, province, city_id, city, district, postal_code, full_address, is_default } = req.body;

    if (is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    const count = await UserAddress.count({ where: { user_id: req.user.id } });
    const address = await UserAddress.create({
      user_id: req.user.id, label, recipient_name, phone,
      province_id: province_id || null, province,
      city_id: city_id || null, city,
      district, postal_code, full_address,
      is_default: is_default || count === 0
    });

    return res.status(201).json({ success: true, message: 'Alamat berhasil ditambahkan', data: { address } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });

    const { label, recipient_name, phone, province_id, province, city_id, city, district, postal_code, full_address, is_default } = req.body;

    if (is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    await address.update({
      label, recipient_name, phone,
      province_id: province_id || null, province,
      city_id: city_id || null, city,
      district, postal_code, full_address, is_default
    });
    return res.json({ success: true, message: 'Alamat berhasil diperbarui', data: { address } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });

    await address.destroy();
    return res.json({ success: true, message: 'Alamat berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });

    await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    await address.update({ is_default: true });

    return res.json({ success: true, message: 'Alamat utama berhasil diubah', data: { address } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
