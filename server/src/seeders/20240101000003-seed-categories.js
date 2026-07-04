'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Daging Segar',
        slug: 'daging-segar',
        description: 'Daging sapi segar pilihan berkualitas tinggi, dipotong setiap hari untuk menjaga kesegaran dan cita rasa terbaik.',
        image_url: '/images/daging semur 500gram.jpg.jpeg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Daging Olahan',
        slug: 'daging-olahan',
        description: 'Produk olahan daging sapi premium seperti bakso, sosis, dan kornet dengan bumbu pilihan.',
        image_url: '/images/giling ayam 250 gram.jpg.jpeg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jeroan',
        slug: 'jeroan',
        description: 'Jeroan sapi segar berkualitas tinggi, dibersihkan dengan higienis dan siap diolah.',
        image_url: '/images/hati sapi lokal 500gram.jpg.jpeg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Daging Beku',
        slug: 'daging-beku',
        description: 'Daging sapi beku impor dan lokal dengan kualitas terjamin, dibekukan dengan teknologi modern.',
        image_url: '/images/iga backribs.jpg.jpeg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
