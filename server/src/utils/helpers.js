'use strict';

const generateOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TF-${date}-${random}`;
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const COURIER_RATES = {
  JNE: { REG: { rate: 0.03, days: '3-5 hari' }, YES: { rate: 0.05, days: '1-2 hari' } },
  JNT: { EZ: { rate: 0.025, days: '3-4 hari' }, EXPRESS: { rate: 0.045, days: '1-2 hari' } },
  SICEPAT: { REG: { rate: 0.028, days: '3-5 hari' }, BEST: { rate: 0.04, days: '2-3 hari' } },
  ANTERAJA: { 'NEXT DAY': { rate: 0.06, days: '1 hari' }, REGULAR: { rate: 0.022, days: '4-6 hari' } }
};

const calculateShipping = (courier, service, weightGram) => {
  const courierData = COURIER_RATES[courier];
  if (!courierData) return 0;
  const serviceData = courierData[service];
  if (!serviceData) return 0;
  return Math.ceil(weightGram * serviceData.rate);
};

const getShippingOptions = () => {
  const options = [];
  for (const [courier, services] of Object.entries(COURIER_RATES)) {
    for (const [service, data] of Object.entries(services)) {
      options.push({ courier, service, rate: data.rate, days: data.days });
    }
  }
  return options;
};

module.exports = { generateOrderNumber, generateSlug, sanitizeInput, calculateShipping, getShippingOptions, COURIER_RATES };
