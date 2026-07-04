'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('settings', [
      { key: 'store_name', value: 'Triple-F Store', created_at: new Date(), updated_at: new Date() },
      { key: 'store_address', value: 'Jl. Raya Daging No. 1, Jakarta Selatan, DKI Jakarta 12110', created_at: new Date(), updated_at: new Date() },
      { key: 'store_phone', value: '021-12345678', created_at: new Date(), updated_at: new Date() },
      { key: 'store_email', value: 'info@triplef.com', created_at: new Date(), updated_at: new Date() },
      { key: 'store_hours', value: 'Senin - Sabtu: 07.00 - 20.00 WIB', created_at: new Date(), updated_at: new Date() },
      { key: 'bank_bca', value: '1234567890 a.n. Triple-F Store', created_at: new Date(), updated_at: new Date() },
      { key: 'bank_bri', value: '0987654321 a.n. Triple-F Store', created_at: new Date(), updated_at: new Date() },
      { key: 'bank_mandiri', value: '1122334455 a.n. Triple-F Store', created_at: new Date(), updated_at: new Date() },
      { key: 'ewallet_gopay', value: '081234567890', created_at: new Date(), updated_at: new Date() },
      { key: 'ewallet_ovo', value: '081234567890', created_at: new Date(), updated_at: new Date() },
      { key: 'ewallet_dana', value: '081234567890', created_at: new Date(), updated_at: new Date() },
      { key: 'announcement_text', value: 'Promo Spesial! Gratis ongkir untuk pembelian di atas Rp 300.000', created_at: new Date(), updated_at: new Date() },
      { key: 'announcement_active', value: 'true', created_at: new Date(), updated_at: new Date() },
      { key: 'announcement_expiry', value: '2025-12-31', created_at: new Date(), updated_at: new Date() },
      { key: 'owner_whatsapp', value: '6281234567890', created_at: new Date(), updated_at: new Date() }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('settings', null, {});
  }
};
