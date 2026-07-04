'use strict';

const { Wishlist, Product, Category } = require('../models');

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Product, as: 'product',
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
      }],
      order: [['created_at', 'DESC']]
    });
    return res.json({ success: true, data: { wishlist: items } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product || !product.is_active) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const existing = await Wishlist.findOne({ where: { user_id: req.user.id, product_id: req.params.productId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Produk sudah ada di wishlist' });
    }

    const item = await Wishlist.create({ user_id: req.user.id, product_id: req.params.productId });
    return res.status(201).json({ success: true, message: 'Produk ditambahkan ke wishlist', data: { item } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({ where: { user_id: req.user.id, product_id: req.params.productId } });
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan di wishlist' });

    await item.destroy();
    return res.json({ success: true, message: 'Produk dihapus dari wishlist' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
