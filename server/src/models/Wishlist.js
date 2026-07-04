'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Wishlist', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'wishlists', underscored: true, updatedAt: false });
};
