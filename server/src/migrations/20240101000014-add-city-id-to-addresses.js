'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('user_addresses');

    if (!desc.city_id) {
      await queryInterface.addColumn('user_addresses', 'city_id', {
        type: Sequelize.STRING(10),
        allowNull: true,
        after: 'city'
      });
    }
    if (!desc.province_id) {
      await queryInterface.addColumn('user_addresses', 'province_id', {
        type: Sequelize.STRING(10),
        allowNull: true,
        after: 'province'
      });
    }
  },
  async down(queryInterface) {
    const desc = await queryInterface.describeTable('user_addresses');
    if (desc.city_id)     await queryInterface.removeColumn('user_addresses', 'city_id');
    if (desc.province_id) await queryInterface.removeColumn('user_addresses', 'province_id');
  }
};
