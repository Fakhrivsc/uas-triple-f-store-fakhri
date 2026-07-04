'use strict';

const { Product, Category, Review, User } = require('../models');
const { generateSlug } = require('../utils/helpers');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, min_price, max_price, sort = 'created_at',
      order = 'DESC', page = 1, limit = 12, is_active, low_stock
    } = req.query;

    const where = {};
    if (req.user?.role !== 'admin') where.is_active = true;
    else if (is_active !== undefined) where.is_active = is_active === 'true';

    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category_id = category;
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }
    if (low_stock === 'true') where.stock = { [Op.lt]: 10 };

    const validSorts = ['name', 'price', 'stock', 'created_at'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    return res.json({
      success: true,
      data: { products: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        {
          model: Review, as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const avgRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    const related = await Product.findAll({
      where: { category_id: product.category_id, id: { [Op.ne]: product.id }, is_active: true },
      limit: 4,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });

    return res.json({ success: true, data: { product: { ...product.toJSON(), avg_rating: avgRating }, related } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, description, price, discount_price, stock, weight_gram, unit, is_active } = req.body;

    let slug = generateSlug(name);
    const existing = await Product.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const images = req.files ? req.files.map(f => `/uploads/products/${f.filename}`) : [];

    const product = await Product.create({
      name, slug, category_id, description, price: parseFloat(price),
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: parseInt(stock) || 0, weight_gram: parseInt(weight_gram),
      unit: unit || 'gram', images, is_active: is_active !== 'false'
    });

    const result = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });

    return res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data: { product: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const { name, category_id, description, price, discount_price, stock, weight_gram, unit, is_active, remove_images } = req.body;

    const updates = {
      category_id, description,
      price: price ? parseFloat(price) : product.price,
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      weight_gram: weight_gram ? parseInt(weight_gram) : product.weight_gram,
      unit: unit || product.unit,
      is_active: is_active !== undefined ? is_active !== 'false' : product.is_active
    };

    if (name && name !== product.name) {
      let slug = generateSlug(name);
      const existing = await Product.findOne({ where: { slug, id: { [Op.ne]: product.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updates.name = name;
      updates.slug = slug;
    }

    let currentImages = product.images || [];
    if (remove_images) {
      const toRemove = Array.isArray(remove_images) ? remove_images : [remove_images];
      currentImages = currentImages.filter(img => !toRemove.includes(img));
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/products/${f.filename}`);
      currentImages = [...currentImages, ...newImages].slice(0, 5);
    }

    updates.images = currentImages;
    await product.update(updates);

    const result = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });

    return res.json({ success: true, message: 'Produk berhasil diperbarui', data: { product: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const { hard } = req.query;
    if (hard === 'true') {
      await product.destroy();
      return res.json({ success: true, message: 'Produk berhasil dihapus permanen' });
    }

    await product.update({ is_active: false });
    return res.json({ success: true, message: 'Produk berhasil dinonaktifkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, is_active } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs produk diperlukan' });
    }
    await Product.update({ is_active }, { where: { id: { [Op.in]: ids } } });
    return res.json({ success: true, message: `${ids.length} produk berhasil diperbarui` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
