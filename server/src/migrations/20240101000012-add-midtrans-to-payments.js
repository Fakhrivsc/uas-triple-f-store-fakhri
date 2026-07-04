'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('payments');

    if (!tableDesc.snap_token) {
      await queryInterface.addColumn('payments', 'snap_token', {
        type: Sequelize.STRING(500),
        allowNull: true,
        after: 'payment_proof_url'
      });
    }

    if (!tableDesc.snap_redirect_url) {
      await queryInterface.addColumn('payments', 'snap_redirect_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        after: 'snap_token'
      });
    }

    // Extend method ENUM to include 'midtrans'
    if (tableDesc.method) {
      await queryInterface.changeColumn('payments', 'method', {
        type: Sequelize.ENUM('bank_transfer', 'e-wallet', 'credit_card', 'midtrans'),
        allowNull: false
      });
    }

    // Extend status ENUM to include 'expired'
    if (tableDesc.status) {
      await queryInterface.changeColumn('payments', 'status', {
        type: Sequelize.ENUM('pending', 'confirmed', 'rejected', 'refunded', 'expired'),
        defaultValue: 'pending'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('payments');
    if (tableDesc.snap_token) await queryInterface.removeColumn('payments', 'snap_token');
    if (tableDesc.snap_redirect_url) await queryInterface.removeColumn('payments', 'snap_redirect_url');
  }
};
