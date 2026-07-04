'use strict';

const { User, Order, OrderItem, Product } = require('../models');
const { Op } = require('sequelize');
const path = require('path');

exports.getMe = async (req, res) => {
  try {
    return res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    return res.json({ success: true, message: 'Profil berhasil diperbarui', data: { user: req.user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File gambar diperlukan' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await req.user.update({ avatar_url: avatarUrl });
    return res.json({ success: true, message: 'Avatar berhasil diperbarui', data: { avatar_url: avatarUrl } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah' });
    }
    await user.update({ password: new_password });
    return res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, is_active, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { users: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Order, as: 'orders', limit: 10, order: [['created_at', 'DESC']] }]
    });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    return res.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Tidak dapat mengubah status admin' });

    await user.update({ is_active: req.body.is_active });
    return res.json({ success: true, message: 'Status user berhasil diperbarui', data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
