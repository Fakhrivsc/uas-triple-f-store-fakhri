'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('user_addresses', [
      {
        user_id: 2,
        label: 'Rumah',
        recipient_name: 'Budi Santoso',
        phone: '082345678901',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        postal_code: '12110',
        full_address: 'Jl. Melati No. 12, RT 03/RW 05, Kebayoran Baru',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3,
        label: 'Rumah',
        recipient_name: 'Siti Rahayu',
        phone: '083456789012',
        province: 'Jawa Barat',
        city: 'Bandung',
        district: 'Cicendo',
        postal_code: '40172',
        full_address: 'Jl. Anggrek No. 7, RT 01/RW 02, Cicendo',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 4,
        label: 'Rumah',
        recipient_name: 'Ahmad Fauzi',
        phone: '084567890123',
        province: 'Jawa Tengah',
        city: 'Semarang',
        district: 'Semarang Tengah',
        postal_code: '50134',
        full_address: 'Jl. Mawar No. 15, RT 02/RW 04, Semarang Tengah',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('user_addresses', null, {});
  }
};
