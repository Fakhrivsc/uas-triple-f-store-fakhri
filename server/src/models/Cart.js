'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }
  }, { tableName: 'carts', underscored: true });
};
