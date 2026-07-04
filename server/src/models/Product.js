'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    discount_price: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    weight_gram: { type: DataTypes.INTEGER, allowNull: false },
    unit: { type: DataTypes.ENUM('kg', 'gram', 'pack'), defaultValue: 'gram' },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      // Always return a proper array regardless of how the DB driver delivers it
      get() {
        const raw = this.getDataValue('images');
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { return JSON.parse(raw); } catch { return []; }
      }
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'products', underscored: true });

  return Product;
};
