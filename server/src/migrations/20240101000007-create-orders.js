'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT'
      },
      address_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'user_addresses', key: 'id' },
        onDelete: 'SET NULL'
      },
      order_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending'
      },
      subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      shipping_cost: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      courier: { type: Sequelize.STRING(50), allowNull: true },
      service_type: { type: Sequelize.STRING(50), allowNull: true },
      payment_method: { type: Sequelize.STRING(50), allowNull: true },
      payment_deadline: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'SET NULL'
      },
      product_name: { type: Sequelize.STRING(200), allowNull: false },
      product_price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      weight_gram: { type: Sequelize.INTEGER, allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
  }
};
