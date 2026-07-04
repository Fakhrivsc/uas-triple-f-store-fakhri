'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
['avatars', 'products', 'categories', 'payments', 'settings'].forEach(dir => {
  const p = path.join(uploadDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(uploadDir));

// Routes
const API = '/api/v1';
app.use(`${API}/auth`, require('./routes/auth'));
app.use(`${API}/users`, require('./routes/users'));
app.use(`${API}/addresses`, require('./routes/addresses'));
app.use(`${API}/categories`, require('./routes/categories'));
app.use(`${API}/products`, require('./routes/products'));
app.use(`${API}/wishlist`, require('./routes/wishlist'));
app.use(`${API}/cart`, require('./routes/cart'));
app.use(`${API}/orders`, require('./routes/orders'));
app.use(`${API}/payments`, require('./routes/payments'));
app.use(`${API}/shipments`, require('./routes/shipments'));
app.use(`${API}/reviews`, require('./routes/reviews'));
app.use(`${API}/dashboard`, require('./routes/dashboard'));
app.use(`${API}/settings`, require('./routes/settings'));
app.use(`${API}/shipping`, require('./routes/shipping'));

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'Triple-F Store API is running' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 5MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

// Start server
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 Triple-F Store API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
