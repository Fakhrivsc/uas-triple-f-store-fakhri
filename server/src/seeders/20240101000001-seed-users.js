'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hashedAdmin = await bcrypt.hash('Admin123!', 12);
    const hashedCustomer = await bcrypt.hash('Customer123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin Triple-F',
        email: 'admin@triplef.com',
        password: hashedAdmin,
        phone: '081234567890',
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        password: hashedCustomer,
        phone: '082345678901',
        role: 'customer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Siti Rahayu',
        email: 'siti.rahayu@gmail.com',
        password: hashedCustomer,
        phone: '083456789012',
        role: 'customer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@gmail.com',
        password: hashedCustomer,
        phone: '084567890123',
        role: 'customer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
