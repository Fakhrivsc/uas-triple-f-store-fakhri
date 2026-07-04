'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Shipment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    courier: { type: DataTypes.ENUM('JNE', 'JNT', 'SICEPAT', 'ANTERAJA'), allowNull: false },
    service_type: { type: DataTypes.STRING(50), allowNull: false },
    tracking_number: { type: DataTypes.STRING(100), allowNull: true },
    status: { type: DataTypes.ENUM('waiting', 'picked_up', 'in_transit', 'delivered'), defaultValue: 'waiting' },
    estimated_date: { type: DataTypes.DATE, allowNull: true }
  }, { tableName: 'shipments', underscored: true });
};
