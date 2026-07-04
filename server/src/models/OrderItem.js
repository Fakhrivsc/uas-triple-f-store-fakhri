'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    product_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    weight_gram: { type: DataTypes.INTEGER, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
  }, { tableName: 'order_items', underscored: true, timestamps: false });
};
