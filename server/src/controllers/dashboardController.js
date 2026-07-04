'use strict';

const { Order, OrderItem, Product, User, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue] = await sequelize.query(
      `SELECT COALESCE(SUM(p.amount), 0) as revenue FROM payments p 
       JOIN orders o ON p.order_id = o.id 
       WHERE p.status = 'confirmed' AND o.created_at >= :startOfMonth`,
      { replacements: { startOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    const totalOrders = await Order.count();
    const monthOrders = await Order.count({ where: { created_at: { [Op.gte]: startOfMonth } } });
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalProducts = await Product.count({ where: { is_active: true } });
    const lowStockProducts = await Product.findAll({ where: { stock: { [Op.lt]: 10 }, is_active: true }, limit: 10 });
    const pendingPayments = await Payment.count({ where: { status: 'pending' } });

    const recentOrders = await Order.findAll({
      limit: 10, order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    return res.json({
      success: true,
      data: {
        revenue: parseFloat(totalRevenue.revenue),
        totalOrders, monthOrders, totalCustomers, totalProducts,
        lowStockProducts, pendingPayments, recentOrders
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const data = await sequelize.query(
      `SELECT DATE(o.created_at) as date, COALESCE(SUM(p.amount), 0) as revenue, COUNT(o.id) as orders
       FROM orders o LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'confirmed'
       WHERE o.created_at >= :startDate
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC`,
      { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }
    );

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = data.find(r => r.date === dateStr || (r.date && r.date.toISOString && r.date.toISOString().slice(0, 10) === dateStr));
      result.push({ date: dateStr, revenue: found ? parseFloat(found.revenue) : 0, orders: found ? parseInt(found.orders) : 0 });
    }

    return res.json({ success: true, data: { chart: result } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const data = await sequelize.query(
      `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE o.status NOT IN ('cancelled', 'refunded')
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.json({ success: true, data: { top_products: data } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};
