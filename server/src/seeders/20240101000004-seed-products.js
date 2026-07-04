'use strict';

// category_id: 1=Daging Segar, 2=Daging Olahan, 3=Jeroan, 4=Daging Beku

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('products', [
      {
        category_id: 1, name: 'Daging Steak', slug: 'daging-steak',
        description: 'Daging sapi pilihan untuk steak, tekstur lembut dan empuk dengan marbling sempurna.',
        price: 185000, discount_price: 165000, stock: 50, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/daging steak.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Daging Semur 500gram', slug: 'daging-semur-500gram',
        description: 'Daging sapi potongan khusus untuk semur, empuk dan mudah meresap bumbu.',
        price: 95000, discount_price: null, stock: 60, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/daging semur 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Daging Semur 1kg', slug: 'daging-semur-1kg',
        description: 'Daging sapi potongan khusus untuk semur ukuran 1kg, hemat untuk keluarga besar.',
        price: 180000, discount_price: 165000, stock: 40, weight_gram: 1000, unit: 'gram',
        images: JSON.stringify(['/images/daging semur 1kg.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Iga Neckbone Lokal', slug: 'iga-neckbone-lokal',
        description: 'Iga neckbone sapi lokal segar, cocok untuk sup iga, iga bakar, atau kaldu.',
        price: 75000, discount_price: null, stock: 35, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/iga neckbone lokal.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Iga Neckbone Super 500gram', slug: 'iga-neckbone-super-500gram',
        description: 'Iga neckbone sapi super pilihan, daging lebih tebal dan berkualitas premium.',
        price: 95000, discount_price: 85000, stock: 30, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/iga neckbone super 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Iga Neckbone Special 500gram', slug: 'iga-neckbone-special-500gram',
        description: 'Iga neckbone sapi special grade, potongan terbaik dengan daging melimpah.',
        price: 110000, discount_price: null, stock: 25, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/iga neckbone special 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Iga Backribs', slug: 'iga-backribs',
        description: 'Iga backribs sapi premium, potongan iga belakang dengan daging tebal dan juicy.',
        price: 130000, discount_price: 115000, stock: 20, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/iga backribs.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Tetelan Sop', slug: 'tetelan-sop',
        description: 'Tetelan sapi khusus untuk sop, menghasilkan kaldu yang gurih dan kaya rasa.',
        price: 65000, discount_price: null, stock: 55, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/tetelan sop.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Tetelan Buntut 500gram', slug: 'tetelan-buntut-500gram',
        description: 'Tetelan buntut sapi segar, menghasilkan kaldu yang kaya kolagen dan gurih.',
        price: 70000, discount_price: null, stock: 40, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/tetelan buntut 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Tetelan Ekonomis 500gram', slug: 'tetelan-ekonomis-500gram',
        description: 'Tetelan sapi ekonomis, pilihan hemat untuk masakan sehari-hari.',
        price: 50000, discount_price: null, stock: 70, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/tetelan ekonomis 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Buntut Sapi Super 500gram', slug: 'buntut-sapi-super-500gram',
        description: 'Buntut sapi super pilihan, daging tebal dan kaya kolagen.',
        price: 120000, discount_price: 105000, stock: 25, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/buntut sapi super 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Buntut Mini 500gram', slug: 'buntut-mini-500gram',
        description: 'Buntut sapi mini ukuran 500gram, cocok untuk porsi keluarga kecil.',
        price: 90000, discount_price: null, stock: 30, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/buntut mini 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Buntut Center B 500gram', slug: 'buntut-center-b-500gram',
        description: 'Buntut sapi center cut grade B, potongan tengah buntut dengan daging merata.',
        price: 100000, discount_price: 90000, stock: 20, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/buntut center b 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, name: 'Paha Fillet 500gram', slug: 'paha-fillet-500gram',
        description: 'Paha fillet sapi segar, daging tanpa lemak berlebih dan bertekstur lembut.',
        price: 110000, discount_price: null, stock: 45, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/paha fillet 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 2, name: 'Teriyaki Slice dan Sukiyaki Slice 250 gram', slug: 'teriyaki-slice-dan-sukiyaki-slice-250gram',
        description: 'Daging sapi iris tipis siap masak untuk teriyaki dan sukiyaki, ukuran 250gram.',
        price: 65000, discount_price: 55000, stock: 80, weight_gram: 250, unit: 'gram',
        images: JSON.stringify(['/images/teriyaki slice dan sukiyaki slice 250 gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 2, name: 'Teriyaki Slice dan Sukiyaki Slice 500 gram', slug: 'teriyaki-slice-dan-sukiyaki-slice-500gram',
        description: 'Daging sapi iris tipis siap masak untuk teriyaki dan sukiyaki, ukuran 500gram.',
        price: 120000, discount_price: 105000, stock: 60, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/teriyaki slice dan sukiyaki slice 500 gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 2, name: 'Giling Ayam 250 gram', slug: 'giling-ayam-250gram',
        description: 'Daging ayam giling segar 250gram, cocok untuk bakso ayam atau nugget homemade.',
        price: 30000, discount_price: null, stock: 100, weight_gram: 250, unit: 'gram',
        images: JSON.stringify(['/images/giling ayam 250 gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 2, name: 'Fillet Dada Ayam 500gram', slug: 'fillet-dada-ayam-500gram',
        description: 'Fillet dada ayam segar tanpa tulang dan kulit, tinggi protein rendah lemak.',
        price: 45000, discount_price: 40000, stock: 90, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/fillet dada ayam 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 3, name: 'Hati Sapi Lokal 500gram', slug: 'hati-sapi-lokal-500gram',
        description: 'Hati sapi lokal segar 500gram, kaya zat besi dan vitamin B12.',
        price: 55000, discount_price: 48000, stock: 40, weight_gram: 500, unit: 'gram',
        images: JSON.stringify(['/images/hati sapi lokal 500gram.jpg.jpeg']),
        is_active: true, created_at: new Date(), updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
