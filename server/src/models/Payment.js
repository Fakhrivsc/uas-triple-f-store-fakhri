'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    method: { type: DataTypes.ENUM('bank_transfer', 'e-wallet', 'credit_card', 'midtrans'), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'refunded', 'expired'),
      defaultValue: 'pending'
    },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_proof_url: { type: DataTypes.STRING(500), allowNull: true },
    snap_token: { type: DataTypes.STRING(500), allowNull: true },
    snap_redirect_url: { type: DataTypes.STRING(500), allowNull: true },
    confirmed_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'payments', underscored: true });
};
