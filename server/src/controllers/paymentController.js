'use strict';

const { Payment, Order, OrderItem, User } = require('../models');
const { Op } = require('sequelize');
const { snap, coreApi } = require('../config/midtrans');

// ─── Midtrans: Create Snap Transaction ───────────────────────────────────────

exports.createMidtransTransaction = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const nameParts = (order.user.name || 'Customer').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build item_details from order items using stored subtotal to avoid rounding drift
    const itemDetails = order.items.map(item => {
      const price = Math.round(parseFloat(item.product_price));
      const quantity = item.quantity;
      return {
        id: String(item.product_id),
        price,
        quantity,
        name: item.product_name.substring(0, 50)
      };
    });

    // Add shipping cost as a separate line item if > 0
    const shippingCost = Math.round(parseFloat(order.shipping_cost || 0));
    if (shippingCost > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: shippingCost,
        quantity: 1,
        name: `Ongkos Kirim (${order.courier || 'Kurir'} ${order.service_type || ''})`.trim().substring(0, 50)
      });
    }

    // Validate: sum of item_details must equal gross_amount
    const calculatedTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const grossAmount = Math.round(parseFloat(order.total));

    if (calculatedTotal !== grossAmount) {
      // Adjust with a rounding correction item to make them match
      const diff = grossAmount - calculatedTotal;
      if (diff !== 0) {
        itemDetails.push({
          id: 'ADJUSTMENT',
          price: diff,
          quantity: 1,
          name: 'Penyesuaian Harga'
        });
      }
    }

    const parameter = {
      transaction_details: {
        order_id: order.order_number,
        gross_amount: grossAmount
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: order.user.email,
        phone: order.user.phone || ''
      },
      item_details: itemDetails,
      enabled_payments: [
        'credit_card', 'bca_va', 'bni_va', 'bri_va', 'permata_va',
        'other_va', 'gopay', 'shopeepay', 'qris', 'bank_transfer',
        'mandiri_clickpay', 'cimb_clicks', 'bca_klikbca', 'bca_klikpay',
        'bri_epay', 'telkomsel_cash', 'akulaku', 'kredivo'
      ],
      callbacks: {
        finish: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/${order.id}`
      }
    };

    const transaction = await snap.createTransaction(parameter);

    // Store snap token on payment record
    await Payment.update(
      { snap_token: transaction.token, snap_redirect_url: transaction.redirect_url },
      { where: { order_id: order.id } }
    );

    return res.json({
      success: true,
      data: {
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
        orderId: order.id,
        orderNumber: order.order_number
      }
    });
  } catch (err) {
    console.error('Midtrans create transaction error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal membuat transaksi pembayaran'
    });
  }
};

// ─── Midtrans: Webhook Notification ──────────────────────────────────────────

exports.handleMidtransNotification = async (req, res) => {
  try {
    const notification = await coreApi.transaction.notification(req.body);

    const {
      order_id: orderNumber,
      transaction_status,
      fraud_status,
      payment_type
    } = notification;

    const order = await Order.findOne({
      where: { order_number: orderNumber },
      include: [{ model: Payment, as: 'payment' }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    let orderStatus = order.status;
    let paymentStatus = order.payment?.status || 'pending';

    // Map Midtrans status to our status
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        orderStatus = 'paid';
        paymentStatus = 'confirmed';
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'paid';
      paymentStatus = 'confirmed';
    } else if (transaction_status === 'pending') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      orderStatus = transaction_status === 'expire' ? 'cancelled' : 'cancelled';
      paymentStatus = transaction_status === 'expire' ? 'expired' : 'rejected';
    } else if (transaction_status === 'refund') {
      orderStatus = 'refunded';
      paymentStatus = 'refunded';
    }

    await order.update({ status: orderStatus });

    if (order.payment) {
      await order.payment.update({
        status: paymentStatus,
        method: payment_type || order.payment.method,
        confirmed_at: paymentStatus === 'confirmed' ? new Date() : order.payment.confirmed_at
      });
    }

    return res.json({ success: true, message: 'Notifikasi berhasil diproses' });
  } catch (err) {
    console.error('Midtrans notification error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses notifikasi' });
  }
};

// ─── Existing endpoints ───────────────────────────────────────────────────────

exports.getPaymentByOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const payment = await Payment.findOne({
      where: { order_id: req.params.orderId },
      include: [{ model: Order, as: 'order', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] }]
    });

    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    return res.json({ success: true, data: { payment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.uploadProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File bukti pembayaran diperlukan' });

    const payment = await Payment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    if (payment.order.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Akses ditolak' });
    if (payment.status !== 'pending') return res.status(400).json({ success: false, message: 'Pembayaran sudah diproses' });

    const proofUrl = `/uploads/payments/${req.file.filename}`;
    await payment.update({ payment_proof_url: proofUrl });
    await payment.order.update({ status: 'paid' });

    return res.json({ success: true, message: 'Bukti pembayaran berhasil diunggah', data: { payment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });

    await payment.update({ status: 'confirmed', confirmed_at: new Date(), notes: req.body.notes });
    await payment.order.update({ status: 'processing' });

    return res.json({ success: true, message: 'Pembayaran berhasil dikonfirmasi', data: { payment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });

    await payment.update({ status: 'rejected', notes: req.body.notes });
    await payment.order.update({ status: 'pending' });

    return res.json({ success: true, message: 'Pembayaran ditolak', data: { payment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });

    await payment.update({ status: 'refunded', notes: req.body.notes });
    await payment.order.update({ status: 'refunded' });

    return res.json({ success: true, message: 'Pembayaran berhasil direfund', data: { payment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const orderWhere = {};
    if (search) orderWhere.order_number = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{
        model: Order, as: 'order', where: orderWhere,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset
    });

    return res.json({
      success: true,
      data: { payments: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
