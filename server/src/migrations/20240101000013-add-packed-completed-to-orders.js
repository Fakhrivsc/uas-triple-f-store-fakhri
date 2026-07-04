'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM(
        'pending', 'paid', 'processing', 'packed',
        'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
      ),
      defaultValue: 'pending'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM(
        'pending', 'paid', 'processing',
        'shipped', 'delivered', 'cancelled', 'refunded'
      ),
      defaultValue: 'pending'
    });
  }
};
