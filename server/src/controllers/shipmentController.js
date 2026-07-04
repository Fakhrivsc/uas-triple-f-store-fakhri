'use strict';

const { Shipment, Order } = require('../models');
const { getShippingOptions } = require('../utils/helpers');

exports.getShippingOptions = async (req, res) => {
  return res.json({ success: true, data: { options: getShippingOptions() } });
};

exports.getShipment = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const shipment = await Shipment.findOne({ where: { order_id: req.params.orderId } });
    if (!shipment) return res.status(404).json({ success: false, message: 'Data pengiriman tidak ditemukan' });

    return res.json({ success: true, data: { shipment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.createOrUpdateShipment = async (req, res) => {
  try {
    const { tracking_number, estimated_date } = req.body;
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    let shipment = await Shipment.findOne({ where: { order_id: order.id } });

    if (shipment) {
      await shipment.update({ tracking_number, estimated_date });
    } else {
      shipment = await Shipment.create({
        order_id: order.id,
        courier: order.courier,
        service_type: order.service_type,
        tracking_number,
        estimated_date,
        status: 'waiting'
      });
    }

    if (tracking_number) {
      await order.update({ status: 'shipped' });
    }

    return res.json({ success: true, message: 'Data pengiriman berhasil diperbarui', data: { shipment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id, { include: [{ model: Order, as: 'order' }] });
    if (!shipment) return res.status(404).json({ success: false, message: 'Data pengiriman tidak ditemukan' });

    const { status } = req.body;
    await shipment.update({ status });

    if (status === 'delivered') {
      await shipment.order.update({ status: 'delivered' });
    }

    return res.json({ success: true, message: 'Status pengiriman berhasil diperbarui', data: { shipment } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
