'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shipments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false, unique: true,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      courier: { type: Sequelize.ENUM('JNE', 'JNT', 'SICEPAT', 'ANTERAJA'), allowNull: false },
      service_type: { type: Sequelize.STRING(50), allowNull: false },
      tracking_number: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM('waiting', 'picked_up', 'in_transit', 'delivered'),
        defaultValue: 'waiting'
      },
      estimated_date: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('shipments');
  }
};
