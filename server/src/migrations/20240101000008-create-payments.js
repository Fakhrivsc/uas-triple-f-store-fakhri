'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false, unique: true,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      method: {
        type: Sequelize.ENUM('bank_transfer', 'e-wallet', 'credit_card'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'rejected', 'refunded'),
        defaultValue: 'pending'
      },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      payment_proof_url: { type: Sequelize.STRING(500), allowNull: true },
      confirmed_at: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  }
};
