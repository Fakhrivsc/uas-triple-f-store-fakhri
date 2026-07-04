'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      category_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'RESTRICT'
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(220), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      discount_price: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      weight_gram: { type: Sequelize.INTEGER, allowNull: false },
      unit: { type: Sequelize.ENUM('kg', 'gram', 'pack'), defaultValue: 'gram' },
      images: { type: Sequelize.JSON, defaultValue: [] },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
