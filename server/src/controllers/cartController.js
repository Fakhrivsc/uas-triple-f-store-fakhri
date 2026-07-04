'use strict';

const { Cart, CartItem, Product, Category } = require('../models');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) cart = await Cart.create({ user_id: userId });
  return cart;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem, as: 'items',
        include: [{
          model: Product, as: 'product',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        }]
      }]
    });

    if (!cart) return res.json({ success: true, data: { cart: { items: [], total: 0 } } });

    const total = cart.items.reduce((sum, item) => {
      const price = item.product.discount_price || item.product.price;
      return sum + (parseFloat(price) * item.quantity);
    }, 0);

    return res.json({ success: true, data: { cart: { ...cart.toJSON(), total } } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
    }

    const cart = await getOrCreateCart(req.user.id);
    let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

    if (item) {
      const newQty = item.quantity + parseInt(quantity);
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
      }
      await item.update({ quantity: newQty });
    } else {
      item = await CartItem.create({ cart_id: cart.id, product_id, quantity: parseInt(quantity) });
    }

    return res.json({ success: true, message: 'Produk ditambahkan ke keranjang', data: { item } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Keranjang tidak ditemukan' });

    const item = await CartItem.findOne({ where: { id: req.params.itemId, cart_id: cart.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    const { quantity } = req.body;
    if (quantity <= 0) {
      await item.destroy();
      return res.json({ success: true, message: 'Item dihapus dari keranjang' });
    }

    const product = await Product.findByPk(item.product_id);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
    }

    await item.update({ quantity: parseInt(quantity) });
    return res.json({ success: true, message: 'Keranjang diperbarui', data: { item } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Keranjang tidak ditemukan' });

    const item = await CartItem.findOne({ where: { id: req.params.itemId, cart_id: cart.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    await item.destroy();
    return res.json({ success: true, message: 'Item dihapus dari keranjang' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) await CartItem.destroy({ where: { cart_id: cart.id } });
    return res.json({ success: true, message: 'Keranjang berhasil dikosongkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { items } = req.body; // [{ product_id, quantity }]
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Data keranjang tidak valid' });
    }

    const cart = await getOrCreateCart(req.user.id);

    for (const guestItem of items) {
      const product = await Product.findByPk(guestItem.product_id);
      if (!product || !product.is_active) continue;

      let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id: guestItem.product_id } });
      if (item) {
        const newQty = Math.min(item.quantity + guestItem.quantity, product.stock);
        await item.update({ quantity: newQty });
      } else {
        const qty = Math.min(guestItem.quantity, product.stock);
        if (qty > 0) await CartItem.create({ cart_id: cart.id, product_id: guestItem.product_id, quantity: qty });
      }
    }

    return res.json({ success: true, message: 'Keranjang berhasil digabungkan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
