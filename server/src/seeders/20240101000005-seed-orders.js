'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('orders', [
      {
        user_id: 2, address_id: 1,
        order_number: 'TF-20240101-00001',
        status: 'delivered',
        subtotal: 330000, shipping_cost: 15000, total: 345000,
        notes: null, courier: 'JNE', service_type: 'REG',
        payment_method: 'bank_transfer',
        payment_deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        created_at: new Date('2024-01-01'), updated_at: new Date('2024-01-05')
      },
      {
        user_id: 3, address_id: 2,
        order_number: 'TF-20240115-00002',
        status: 'processing',
        subtotal: 165000, shipping_cost: 18000, total: 183000,
        notes: 'Tolong dikemas dengan baik', courier: 'JNT', service_type: 'EXPRESS',
        payment_method: 'e-wallet',
        payment_deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        created_at: new Date('2024-01-15'), updated_at: new Date('2024-01-16')
      },
      {
        user_id: 4, address_id: 3,
        order_number: 'TF-20240120-00003',
        status: 'pending',
        subtotal: 420000, shipping_cost: 25000, total: 445000,
        notes: null, courier: 'SICEPAT', service_type: 'REG',
        payment_method: 'bank_transfer',
        payment_deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        created_at: new Date('2024-01-20'), updated_at: new Date('2024-01-20')
      },
      {
        user_id: 2, address_id: 1,
        order_number: 'TF-20240125-00004',
        status: 'shipped',
        subtotal: 85000, shipping_cost: 12000, total: 97000,
        notes: null, courier: 'ANTERAJA', service_type: 'REGULAR',
        payment_method: 'credit_card',
        payment_deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        created_at: new Date('2024-01-25'), updated_at: new Date('2024-01-27')
      },
      {
        user_id: 3, address_id: 2,
        order_number: 'TF-20240130-00005',
        status: 'cancelled',
        subtotal: 120000, shipping_cost: 15000, total: 135000,
        notes: null, courier: 'JNE', service_type: 'YES',
        payment_method: 'bank_transfer',
        payment_deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        created_at: new Date('2024-01-30'), updated_at: new Date('2024-01-30')
      }
    ]);

    await queryInterface.bulkInsert('order_items', [
      { order_id: 1, product_id: 1, product_name: 'Daging Sapi Has Dalam (Tenderloin)', product_price: 165000, quantity: 2, weight_gram: 500, subtotal: 330000 },
      { order_id: 2, product_id: 1, product_name: 'Daging Sapi Has Dalam (Tenderloin)', product_price: 165000, quantity: 1, weight_gram: 500, subtotal: 165000 },
      { order_id: 3, product_id: 9, product_name: 'Daging Sapi Wagyu Beku Import', product_price: 420000, quantity: 1, weight_gram: 300, subtotal: 420000 },
      { order_id: 4, product_id: 3, product_name: 'Daging Sapi Giling Premium', product_price: 85000, quantity: 1, weight_gram: 500, subtotal: 85000 },
      { order_id: 5, product_id: 4, product_name: 'Iga Sapi Segar', product_price: 120000, quantity: 1, weight_gram: 500, subtotal: 120000 }
    ]);

    await queryInterface.bulkInsert('payments', [
      { order_id: 1, method: 'bank_transfer', status: 'confirmed', amount: 345000, payment_proof_url: null, confirmed_at: new Date('2024-01-02'), notes: null, created_at: new Date('2024-01-01'), updated_at: new Date('2024-01-02') },
      { order_id: 2, method: 'e-wallet', status: 'confirmed', amount: 183000, payment_proof_url: null, confirmed_at: new Date('2024-01-16'), notes: null, created_at: new Date('2024-01-15'), updated_at: new Date('2024-01-16') },
      { order_id: 3, method: 'bank_transfer', status: 'pending', amount: 445000, payment_proof_url: null, confirmed_at: null, notes: null, created_at: new Date('2024-01-20'), updated_at: new Date('2024-01-20') },
      { order_id: 4, method: 'credit_card', status: 'confirmed', amount: 97000, payment_proof_url: null, confirmed_at: new Date('2024-01-26'), notes: null, created_at: new Date('2024-01-25'), updated_at: new Date('2024-01-26') },
      { order_id: 5, method: 'bank_transfer', status: 'pending', amount: 135000, payment_proof_url: null, confirmed_at: null, notes: null, created_at: new Date('2024-01-30'), updated_at: new Date('2024-01-30') }
    ]);

    await queryInterface.bulkInsert('shipments', [
      { order_id: 1, courier: 'JNE', service_type: 'REG', tracking_number: 'JNE1234567890', status: 'delivered', estimated_date: new Date('2024-01-05'), created_at: new Date('2024-01-02'), updated_at: new Date('2024-01-05') },
      { order_id: 2, courier: 'JNT', service_type: 'EXPRESS', tracking_number: 'JNT9876543210', status: 'in_transit', estimated_date: new Date('2024-01-18'), created_at: new Date('2024-01-16'), updated_at: new Date('2024-01-17') },
      { order_id: 4, courier: 'ANTERAJA', service_type: 'REGULAR', tracking_number: 'ANT5555666677', status: 'in_transit', estimated_date: new Date('2024-01-30'), created_at: new Date('2024-01-26'), updated_at: new Date('2024-01-27') }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('shipments', null, {});
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  }
};
