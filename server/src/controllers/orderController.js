'use strict';

const { Order, OrderItem, Product, User, UserAddress, Payment, Shipment, Setting, sequelize } = require('../models');
const { generateOrderNumber, calculateShipping } = require('../utils/helpers');
const { Op } = require('sequelize');

const ORDER_INCLUDES = [
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'images'] }] },
  { model: UserAddress, as: 'address' },
  { model: Payment, as: 'payment' },
  { model: Shipment, as: 'shipment' },
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
];

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { address_id, items, courier, service_type, payment_method, notes } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Keranjang kosong' });
    }

    const address = await UserAddress.findOne({ where: { id: address_id, user_id: req.user.id } });
    if (!address) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });
    }

    let subtotal = 0;
    let totalWeight = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: true });
      if (!product || !product.is_active) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Produk ${item.product_id} tidak tersedia` });
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Stok ${product.name} tidak mencukupi` });
      }

      const price = parseFloat(product.discount_price || product.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      totalWeight += product.weight_gram * item.quantity;

      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_price: price,
        quantity: item.quantity,
        weight_gram: product.weight_gram,
        subtotal: itemSubtotal
      });

      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }

    const shipping_cost = req.body.shipping_cost
      ? parseFloat(req.body.shipping_cost)
      : calculateShipping(courier, service_type, totalWeight);
    const total = subtotal + shipping_cost;
    const order_number = generateOrderNumber();
    const payment_deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const order = await Order.create({
      user_id: req.user.id, address_id, order_number, status: 'pending',
      subtotal, shipping_cost, total, notes, courier, service_type,
      payment_method, payment_deadline
    }, { transaction: t });

    for (const item of orderItemsData) {
      await OrderItem.create({ order_id: order.id, ...item }, { transaction: t });
    }

    await Payment.create({
      order_id: order.id, method: payment_method, status: 'pending', amount: total
    }, { transaction: t });

    await t.commit();

    // Build WhatsApp notification link for owner
    let waLink = null;
    try {
      const ownerWaSetting = await Setting.findOne({ where: { key: 'owner_whatsapp' } });
      const ownerNumber = (ownerWaSetting?.value || '6281234567890').replace(/[^0-9]/g, '');

      let waText = `*ORDER BARU - Triple-F Store*\n\n`;
      waText += `No. Order: *${order_number}*\n`;
      waText += `Pembayaran: ${payment_method}\n`;
      waText += `Kurir: ${courier} - ${service_type}\n\n`;
      waText += `*Detail Pesanan:*\n`;
      orderItemsData.forEach((item, i) => {
        waText += `${i + 1}. ${item.product_name} x${item.quantity} = Rp${Number(item.subtotal).toLocaleString('id-ID')}\n`;
      });
      waText += `\nSubtotal: Rp${Number(subtotal).toLocaleString('id-ID')}`;
      waText += `\nOngkir (${courier}): Rp${Number(shipping_cost).toLocaleString('id-ID')}`;
      waText += `\n*TOTAL: Rp${Number(total).toLocaleString('id-ID')}*`;
      if (notes) waText += `\n\nCatatan: ${notes}`;
      waText += `\n\n_Mohon dikonfirmasi. Terima kasih!_`;

      waLink = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(waText)}`;
    } catch (waErr) {
      console.error('[WA] Failed to build WhatsApp link:', waErr.message);
    }

    const result = await Order.findByPk(order.id, { include: ORDER_INCLUDES });
    return res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat', data: { order: result, waLink } });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;
    if (search) where.order_number = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where, include: ORDER_INCLUDES,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset
    });

    return res.json({
      success: true,
      data: { orders: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.user_id = req.user.id;

    const order = await Order.findOne({ where, include: ORDER_INCLUDES });
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    return res.json({ success: true, data: { order } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });

    if (!order) { await t.rollback(); return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' }); }
    if (order.status !== 'pending') { await t.rollback(); return res.status(400).json({ success: false, message: 'Pesanan hanya bisa dibatalkan saat status pending' }); }

    for (const item of order.items) {
      await Product.increment('stock', { by: item.quantity, where: { id: item.product_id }, transaction: t });
    }

    await order.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    return res.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [
      { order_number: { [Op.like]: `%${search}%` } }
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where, include: ORDER_INCLUDES,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset
    });

    return res.json({
      success: true,
      data: { orders: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    await order.update({ status });

    // Sync shipment status when order moves to shipped/delivered
    if (status === 'shipped') {
      const shipment = await Shipment.findOne({ where: { order_id: order.id } });
      if (shipment) await shipment.update({ status: 'in_transit' });
    }
    if (status === 'delivered') {
      const shipment = await Shipment.findOne({ where: { order_id: order.id } });
      if (shipment) await shipment.update({ status: 'delivered' });
    }

    return res.json({ success: true, message: 'Status pesanan berhasil diperbarui', data: { order } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
