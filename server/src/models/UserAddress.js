'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserAddress', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING(50), allowNull: false },
    recipient_name: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    province_id: { type: DataTypes.STRING(10), allowNull: true },
    province: { type: DataTypes.STRING(100), allowNull: false },
    city_id: { type: DataTypes.STRING(10), allowNull: true },
    city: { type: DataTypes.STRING(100), allowNull: false },
    district: { type: DataTypes.STRING(100), allowNull: false },
    postal_code: { type: DataTypes.STRING(10), allowNull: false },
    full_address: { type: DataTypes.TEXT, allowNull: false },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'user_addresses', underscored: true });
};
