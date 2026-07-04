'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateTokens = (user, rememberMe = false) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '7d' : '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const user = await User.create({ name, email, phone, password, role: 'customer' });
    const { accessToken, refreshToken } = generateTokens(user);

    await user.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true, message: 'Registrasi berhasil',
      data: { user, accessToken }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const { accessToken, refreshToken } = generateTokens(user, rememberMe);
    await user.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true, message: 'Login berhasil',
      data: { user, accessToken }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ where: { refresh_token: token } });
      if (user) await user.update({ refresh_token: null });
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, refresh_token: token } });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
};
