'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    address_id: { type: DataTypes.INTEGER, allowNull: true },
    order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM(
        'pending', 'paid', 'processing', 'packed',
        'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
      ),
      defaultValue: 'pending'
    },
    subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    shipping_cost: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    courier: { type: DataTypes.STRING(50), allowNull: true },
    service_type: { type: DataTypes.STRING(50), allowNull: true },
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
    payment_deadline: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'orders', underscored: true });
};
