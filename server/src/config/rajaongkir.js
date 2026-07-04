'use strict';

const axios = require('axios');

// RajaOngkir Starter API — free tier
// Docs: https://rajaongkir.com/dokumentasi/starter
const RAJAONGKIR_KEY = process.env.RAJAONGKIR_API_KEY || '';
const BASE_URL = 'https://api.rajaongkir.com/starter';

const rajaongkir = axios.create({
  baseURL: BASE_URL,
  headers: {
    key: RAJAONGKIR_KEY,
    'content-type': 'application/x-www-form-urlencoded'
  },
  timeout: 10000
});

module.exports = rajaongkir;
