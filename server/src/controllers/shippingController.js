'use strict';

const komerce = require('../config/komerce');

// ── In-memory cache (TTL: 1 hour) ────────────────────────────────────────────
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = {
  provinces: null,
  provincesAt: 0,
  cities: {},
  citiesAt: {}
};

function isFresh(timestamp) {
  return Date.now() - timestamp < CACHE_TTL_MS;
}

// ── Helper: extract rajaongkir-compatible results ─────────────────────────────
function extractResults(responseData, field = 'results') {
  // Komerce wraps in rajaongkir envelope (same as RajaOngkir)
  return responseData?.rajaongkir?.[field] ?? responseData?.data ?? null;
}

// ── GET /api/v1/shipping/provinces ────────────────────────────────────────────
exports.getProvinces = async (req, res) => {
  try {
    if (cache.provinces && isFresh(cache.provincesAt)) {
      return res.json({ success: true, data: { provinces: cache.provinces } });
    }

    const response = await komerce.get('/api/v1/province');
    const provinces = extractResults(response.data);

    if (!provinces) {
      throw new Error('Format respons provinsi tidak dikenali');
    }

    cache.provinces = provinces;
    cache.provincesAt = Date.now();

    return res.json({ success: true, data: { provinces } });
  } catch (err) {
    const detail = err.response?.data ?? err.message;
    console.error('[Komerce] getProvinces error:', detail);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data provinsi, silakan coba lagi'
    });
  }
};

// ── GET /api/v1/shipping/cities/:provinceId ───────────────────────────────────
exports.getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (cache.cities[provinceId] && isFresh(cache.citiesAt[provinceId] || 0)) {
      return res.json({ success: true, data: { cities: cache.cities[provinceId] } });
    }

    const response = await komerce.get(`/api/v1/city?province=${provinceId}`);
    const cities = extractResults(response.data);

    if (!cities) {
      throw new Error('Format respons kota tidak dikenali');
    }

    cache.cities[provinceId] = cities;
    cache.citiesAt[provinceId] = Date.now();

    return res.json({ success: true, data: { cities } });
  } catch (err) {
    const detail = err.response?.data ?? err.message;
    console.error('[Komerce] getCities error:', detail);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kota, silakan coba lagi'
    });
  }
};

// ── POST /api/v1/shipping/cost ────────────────────────────────────────────────
// Body: { origin, destination, weight, courier }
//   origin/destination : RajaOngkir city_id (number string)
//   weight             : grams
//   courier            : 'jne' | 'jnt' | 'sicepat'
exports.getCost = async (req, res) => {
  const { origin, destination, weight, courier } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!origin || !destination || !weight || !courier) {
    return res.status(400).json({
      success: false,
      message: 'origin, destination, weight, dan courier wajib diisi'
    });
  }

  const weightGrams = parseInt(weight, 10);
  if (isNaN(weightGrams) || weightGrams <= 0) {
    return res.status(400).json({ success: false, message: 'weight harus berupa angka positif' });
  }

  const originCity = String(origin);
  const destCity   = String(destination);
  const courierKey = courier.toLowerCase();

  // ── Call Komerce API ────────────────────────────────────────────────────────
  try {
    const params = new URLSearchParams({
      origin:          originCity,
      originType:      'city',
      destination:     destCity,
      destinationType: 'city',
      weight:          String(weightGrams),
      courier:         courierKey
    });

    const response = await komerce.post('/api/v1/cost', params.toString());
    const results  = extractResults(response.data);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada layanan pengiriman tersedia untuk rute ini'
      });
    }

    // Flatten all services from all courier results
    const services = [];
    results.forEach(r => {
      (r.costs || []).forEach(cost => {
        const costEntry = Array.isArray(cost.cost) ? cost.cost[0] : cost;
        services.push({
          courier:      r.code?.toUpperCase() ?? courierKey.toUpperCase(),
          courier_name: r.name ?? r.code,
          service:      cost.service,
          description:  cost.description ?? cost.service,
          cost:         costEntry.value ?? costEntry.cost ?? 0,
          etd:          costEntry.etd ?? '-'
        });
      });
    });

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada layanan pengiriman tersedia untuk rute ini'
      });
    }

    return res.json({ success: true, data: { services } });

  } catch (err) {
    // ── Detailed error logging ────────────────────────────────────────────────
    const status  = err.response?.status;
    const apiMsg  = err.response?.data?.rajaongkir?.status?.description
                 ?? err.response?.data?.message
                 ?? err.message;

    console.error(`[Komerce] getCost error — HTTP ${status ?? 'N/A'}:`, apiMsg);
    console.error('[Komerce] Request params:', { origin: originCity, destination: destCity, weight: weightGrams, courier: courierKey });

    if (err.response?.data) {
      console.error('[Komerce] Full API response:', JSON.stringify(err.response.data));
    }

    // ── Fallback to flat-rate if API key missing or network error ─────────────
    if (!process.env.SHIPPING_API_KEY || err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
      console.warn('[Komerce] Falling back to flat-rate estimation');
      return res.json({
        success: true,
        fallback: true,
        data: { services: getFallbackServices(courierKey, weightGrams) }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menghitung ongkir, silakan coba lagi'
    });
  }
};

// ── Flat-rate fallback (used when API key absent or network unreachable) ───────
function getFallbackServices(courier, weightGrams) {
  const RATES = {
    jne:     [
      { service: 'OKE',  description: 'Ongkos Kirim Ekonomis', etd: '4-6', multiplier: 1.0 },
      { service: 'REG',  description: 'Layanan Reguler',        etd: '2-3', multiplier: 1.3 },
      { service: 'YES',  description: 'Yakin Esok Sampai',      etd: '1',   multiplier: 2.0 }
    ],
    jnt:     [
      { service: 'EZ',      description: 'J&T EZ',      etd: '3-4', multiplier: 1.1 },
      { service: 'EXPRESS', description: 'J&T Express', etd: '1-2', multiplier: 1.8 }
    ],
    sicepat: [
      { service: 'REG',  description: 'SiCepat Reguler', etd: '3-5', multiplier: 1.0 },
      { service: 'BEST', description: 'SiCepat BEST',    etd: '1-2', multiplier: 1.6 }
    ]
  };

  const BASE_COST_PER_GRAM = 28; // Rp 28/gram ≈ Rp 14.000 per 500g
  const c = RATES[courier] ? courier : 'jne';

  return RATES[c].map(s => ({
    courier:      c.toUpperCase(),
    courier_name: c.toUpperCase(),
    service:      s.service,
    description:  s.description,
    cost:         Math.ceil(weightGrams * BASE_COST_PER_GRAM * s.multiplier / 1000) * 1000,
    etd:          s.etd
  }));
}
