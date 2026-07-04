'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_addresses', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      label: { type: Sequelize.STRING(50), allowNull: false },
      recipient_name: { type: Sequelize.STRING(100), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      province: { type: Sequelize.STRING(100), allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: false },
      district: { type: Sequelize.STRING(100), allowNull: false },
      postal_code: { type: Sequelize.STRING(10), allowNull: false },
      full_address: { type: Sequelize.TEXT, allowNull: false },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('user_addresses');
  }
};
