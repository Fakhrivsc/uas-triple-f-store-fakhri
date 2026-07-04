'use strict';

const { Review, User, Product, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['created_at', 'DESC']]
    });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Rating distribution (1–5)
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length
    }));

    return res.json({ success: true, data: { reviews, avg_rating: avgRating, total: reviews.length, distribution } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Check if the logged-in user can review a product
exports.getReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find a qualifying order: user bought this product and order is paid/delivered
    const eligibleOrder = await Order.findOne({
      where: {
        user_id: req.user.id,
        status: { [Op.in]: ['paid', 'processing', 'shipped', 'delivered'] }
      },
      include: [{
        model: OrderItem, as: 'items',
        where: { product_id: productId },
        required: true
      }]
    });

    if (!eligibleOrder) {
      return res.json({ success: true, data: { eligible: false, reason: 'Anda belum membeli produk ini' } });
    }

    // Check if already reviewed for this order
    const existing = await Review.findOne({
      where: { user_id: req.user.id, product_id: productId, order_id: eligibleOrder.id }
    });

    if (existing) {
      return res.json({ success: true, data: { eligible: false, reason: 'Anda sudah memberikan ulasan', review: existing } });
    }

    return res.json({ success: true, data: { eligible: true, order_id: eligibleOrder.id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    // Validate the order belongs to this user and contains this product
    const order = await Order.findOne({
      where: {
        id: order_id,
        user_id: req.user.id,
        status: { [Op.in]: ['paid', 'processing', 'shipped', 'delivered'] }
      },
      include: [{
        model: OrderItem, as: 'items',
        where: { product_id },
        required: true
      }]
    });

    if (!order) {
      return res.status(403).json({ success: false, message: 'Anda hanya bisa mengulas produk yang sudah dibeli' });
    }

    const existing = await Review.findOne({ where: { user_id: req.user.id, product_id, order_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Anda sudah memberikan ulasan untuk pesanan ini' });

    const review = await Review.create({ user_id: req.user.id, product_id, order_id, rating, comment });
    const result = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }]
    });

    return res.status(201).json({ success: true, message: 'Ulasan berhasil ditambahkan', data: { review: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan' });

    await review.destroy();
    return res.json({ success: true, message: 'Ulasan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Review.findAndCountAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset
    });

    return res.json({
      success: true,
      data: { reviews: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
