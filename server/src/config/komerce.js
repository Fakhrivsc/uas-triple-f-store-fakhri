'use strict';

const axios = require('axios');

/**
 * Komerce Shipping Cost API
 * Base URL : https://api.komerce.id
 * Auth     : Authorization: Bearer <SHIPPING_API_KEY>
 * Docs     : https://developer.komship.id
 *
 * Compatible response format with RajaOngkir (rajaongkir.results structure).
 */
const komerce = axios.create({
  baseURL: 'https://api.komerce.id',
  headers: {
    Authorization: `Bearer ${process.env.SHIPPING_API_KEY || ''}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json'
  },
  timeout: 12000
});

// Log every outgoing request in development for easier debugging
komerce.interceptors.request.use(config => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Komerce] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

module.exports = komerce;
