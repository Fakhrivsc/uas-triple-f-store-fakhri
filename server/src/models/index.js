'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.UserAddress = require('./UserAddress')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.Product = require('./Product')(sequelize, Sequelize.DataTypes);
db.Wishlist = require('./Wishlist')(sequelize, Sequelize.DataTypes);
db.Cart = require('./Cart')(sequelize, Sequelize.DataTypes);
db.CartItem = require('./CartItem')(sequelize, Sequelize.DataTypes);
db.Order = require('./Order')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
db.Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
db.Shipment = require('./Shipment')(sequelize, Sequelize.DataTypes);
db.Review = require('./Review')(sequelize, Sequelize.DataTypes);
db.Setting = require('./Setting')(sequelize, Sequelize.DataTypes);

// Associations
db.User.hasMany(db.UserAddress, { foreignKey: 'user_id', as: 'addresses' });
db.UserAddress.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.User.hasOne(db.Cart, { foreignKey: 'user_id', as: 'cart' });
db.Cart.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Cart.hasMany(db.CartItem, { foreignKey: 'cart_id', as: 'items' });
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cart_id', as: 'cart' });
db.CartItem.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });
db.Product.hasMany(db.CartItem, { foreignKey: 'product_id', as: 'cartItems' });

db.Category.hasMany(db.Product, { foreignKey: 'category_id', as: 'products' });
db.Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category' });

db.User.hasMany(db.Wishlist, { foreignKey: 'user_id', as: 'wishlists' });
db.Wishlist.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Product.hasMany(db.Wishlist, { foreignKey: 'product_id', as: 'wishlists' });
db.Wishlist.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });

db.User.hasMany(db.Order, { foreignKey: 'user_id', as: 'orders' });
db.Order.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.UserAddress.hasMany(db.Order, { foreignKey: 'address_id', as: 'orders' });
db.Order.belongsTo(db.UserAddress, { foreignKey: 'address_id', as: 'address' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', as: 'items' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id', as: 'order' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });
db.Product.hasMany(db.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

db.Order.hasOne(db.Payment, { foreignKey: 'order_id', as: 'payment' });
db.Payment.belongsTo(db.Order, { foreignKey: 'order_id', as: 'order' });

db.Order.hasOne(db.Shipment, { foreignKey: 'order_id', as: 'shipment' });
db.Shipment.belongsTo(db.Order, { foreignKey: 'order_id', as: 'order' });

db.User.hasMany(db.Review, { foreignKey: 'user_id', as: 'reviews' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Product.hasMany(db.Review, { foreignKey: 'product_id', as: 'reviews' });
db.Review.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });
db.Order.hasMany(db.Review, { foreignKey: 'order_id', as: 'reviews' });
db.Review.belongsTo(db.Order, { foreignKey: 'order_id', as: 'order' });

module.exports = db;
