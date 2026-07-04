'use strict';

const { Category, Product } = require('../models');
const { generateSlug } = require('../utils/helpers');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.getCategories = async (req, res) => {
  try {
    const where = {};
    if (req.query.active !== 'all') where.is_active = true;

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']],
      include: [{ model: Product, as: 'products', attributes: ['id'], where: { is_active: true }, required: false }]
    });

    const result = categories.map(c => ({
      ...c.toJSON(),
      product_count: c.products ? c.products.length : 0,
      products: undefined
    }));

    return res.json({ success: true, data: { categories: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    let slug = generateSlug(name);

    const existing = await Category.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const image_url = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const category = await Category.create({ name, slug, description, image_url, is_active: is_active !== 'false' });
    return res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: { category } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });

    const { name, description, is_active } = req.body;
    const updates = { description, is_active: is_active !== 'false' };

    if (name && name !== category.name) {
      let slug = generateSlug(name);
      const existing = await Category.findOne({ where: { slug, id: { [Op.ne]: category.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updates.name = name;
      updates.slug = slug;
    }

    if (req.file) {
      updates.image_url = `/uploads/categories/${req.file.filename}`;
    }

    await category.update(updates);
    return res.json({ success: true, message: 'Kategori berhasil diperbarui', data: { category } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });

    const productCount = await Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus kategori yang memiliki produk' });
    }

    await category.destroy();
    return res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
