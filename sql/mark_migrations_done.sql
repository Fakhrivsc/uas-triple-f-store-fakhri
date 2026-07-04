-- Mark all migrations as already run so Sequelize skips them
-- (Tables already created via SQL dump import)
INSERT IGNORE INTO SequelizeMeta (name) VALUES
  ('20240101000001-create-users.js'),
  ('20240101000002-create-user-addresses.js'),
  ('20240101000003-create-categories.js'),
  ('20240101000004-create-products.js'),
  ('20240101000005-create-wishlists.js'),
  ('20240101000006-create-carts.js'),
  ('20240101000007-create-orders.js'),
  ('20240101000008-create-payments.js'),
  ('20240101000009-create-shipments.js'),
  ('20240101000010-create-reviews.js'),
  ('20240101000011-create-settings.js'),
  ('20240101000012-add-midtrans-to-payments.js'),
  ('20240101000013-add-packed-completed-to-orders.js'),
  ('20240101000014-add-city-id-to-addresses.js');

SELECT * FROM SequelizeMeta;
