INSERT INTO settings (`key`, value, created_at, updated_at) 
VALUES ('owner_whatsapp', '6281234567890', NOW(), NOW()) 
ON DUPLICATE KEY UPDATE value='6281234567890';
SELECT `key`, value FROM settings LIMIT 20;
