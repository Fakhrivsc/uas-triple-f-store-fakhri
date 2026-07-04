import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Truck, CreditCard, ClipboardList, Loader2, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addressAPI, orderAPI, paymentAPI, shippingAPI } from '../api';
import { clearCart } from '../store/cartSlice';
import { formatCurrency, getImageUrl } from '../utils/format';
import toast from 'react-hot-toast';

const STEPS = ['Alamat', 'Pengiriman', 'Pembayaran', 'Ringkasan'];

const COURIERS = [
  { id: 'jne',     label: 'JNE',     logo: '📦' },
  { id: 'jnt',     label: 'J&T',     logo: '🚚' },
  { id: 'sicepat', label: 'SiCepat', logo: '⚡' },
];

const PAYMENT_METHODS = [
  { id: 'midtrans',     label: 'Bayar via Midtrans',    desc: 'QRIS, GoPay, ShopeePay, VA, Kartu Kredit & lebih', icon: '💳' },
  { id: 'bank_transfer', label: 'Transfer Bank Manual', desc: 'BCA, BRI, Mandiri — upload bukti transfer',         icon: '🏦' },
  { id: 'e-wallet',     label: 'E-Wallet Manual',       desc: 'GoPay, OVO, DANA — upload bukti transfer',          icon: '📱' },
];

// ── Shipping Step Component ───────────────────────────────────────────────────
function ShippingStep({ selectedAddress, totalWeight, selectedShipping, onSelect, onBack, onNext }) {
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch costs whenever courier or address changes
  useEffect(() => {
    if (!selectedAddress) return;
    fetchCost(selectedCourier);
  }, [selectedCourier, selectedAddress]);

  const fetchCost = async (courier) => {
    setLoading(true);
    setError('');
    setServices([]);
    onSelect(null); // reset selection

    try {
      const res = await shippingAPI.getCost({
        origin: import.meta.env.VITE_ORIGIN_CITY_ID || '501',
        destination: selectedAddress.city_id || selectedAddress.city,
        weight: totalWeight,
        courier
      });

      const svcs = res.data.data.services;
      setServices(svcs);

      if (res.data.fallback) {
        toast('Menggunakan tarif estimasi (API key belum dikonfigurasi)', { icon: 'ℹ️' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghitung ongkir';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <Truck size={18} className="text-primary" /> Pilih Kurir & Layanan
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Total berat: <strong>{totalWeight.toLocaleString('id-ID')}g</strong>
        {selectedAddress && (
          <> · Tujuan: <strong>{selectedAddress.city}, {selectedAddress.province}</strong></>
        )}
      </p>

      {/* Courier tabs */}
      <div className="flex gap-2 mb-4">
        {COURIERS.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCourier(c.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200
              ${selectedCourier === c.id
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
          >
            <span>{c.logo}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Services list */}
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="text-sm">Menghitung ongkir...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 text-center">
          {error}
          <button onClick={() => fetchCost(selectedCourier)} className="block mx-auto mt-2 text-primary underline text-xs">
            Coba lagi
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Tidak ada layanan tersedia untuk rute ini
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((svc, i) => {
            const isSelected = selectedShipping?.service === svc.service && selectedShipping?.courier === svc.courier;
            return (
              <label
                key={i}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={isSelected}
                    onChange={() => onSelect(svc)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {svc.courier} <span className="text-primary">{svc.service}</span>
                    </p>
                    <p className="text-xs text-gray-500">{svc.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Estimasi {svc.etd ? `${svc.etd} hari` : '-'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-primary">{formatCurrency(svc.cost)}</span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button onClick={onBack} className="btn-outline flex-1 py-3">Kembali</button>
        <button
          onClick={onNext}
          disabled={!selectedShipping}
          className="btn-primary flex-1 py-3"
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    addressAPI.getAll().then(res => {
      const addrs = res.data.data.addresses;
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def) setSelectedAddress(def);
    });
  }, []);

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.product?.weight_gram || 0) * item.quantity, 0
  );

  const shippingCost = selectedShipping?.cost || 0;
  const grandTotal = total + shippingCost;

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping || !selectedPayment) {
      toast.error('Lengkapi semua data pesanan');
      return;
    }
    setLoading(true);
    try {
      const res = await orderAPI.create({
        address_id: selectedAddress.id,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        courier: selectedShipping.courier,
        service_type: selectedShipping.service,
        shipping_cost: shippingCost,
        payment_method: selectedPayment,
        notes
      });

      const order = res.data.data.order;
      const waLink = res.data.data.waLink;
      dispatch(clearCart());

      if (selectedPayment === 'midtrans') {
        try {
          const txRes = await paymentAPI.createTransaction({ order_id: order.id });
          const { snapToken } = txRes.data.data;

          if (!window.snap) {
            toast.error('Midtrans Snap belum dimuat. Coba muat ulang halaman.');
            navigate(`/payment/${order.id}`);
            return;
          }

          window.snap.pay(snapToken, {
            onSuccess: () => { toast.success('Pembayaran berhasil!'); navigate(`/orders/${order.id}`); },
            onPending: () => { toast('Selesaikan pembayaran Anda.', { icon: '⏳' }); navigate(`/payment/${order.id}`); },
            onError:   () => { toast.error('Pembayaran gagal.'); navigate(`/payment/${order.id}`); },
            onClose:   () => { toast('Popup ditutup.', { icon: 'ℹ️' }); navigate(`/payment/${order.id}`); }
          });
        } catch (snapErr) {
          toast.error(snapErr.response?.data?.message || 'Gagal memuat halaman pembayaran');
          navigate(`/payment/${order.id}`);
        }
      } else {
        toast.success('Pesanan berhasil dibuat!');
        if (waLink) {
          setTimeout(() => window.open(waLink, '_blank'), 300);
        }
        navigate(`/payment/${order.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* ── Step 0: Address ── */}
          {step === 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> Pilih Alamat Pengiriman
              </h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">Belum ada alamat tersimpan</p>
                  <a href="/profile/addresses" className="btn-primary text-sm">Tambah Alamat</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors
                        ${selectedAddress?.id === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio" name="address"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => { setSelectedAddress(addr); setSelectedShipping(null); }}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{addr.label}</span>
                          {addr.is_default && <span className="badge bg-primary/10 text-primary text-xs">Utama</span>}
                        </div>
                        <p className="text-sm text-gray-700">{addr.recipient_name} · {addr.phone}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {addr.full_address}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep(1)}
                disabled={!selectedAddress}
                className="btn-primary w-full mt-4 py-3"
              >
                Lanjut ke Pengiriman
              </button>
            </div>
          )}

          {/* ── Step 1: Shipping (RajaOngkir) ── */}
          {step === 1 && (
            <ShippingStep
              selectedAddress={selectedAddress}
              totalWeight={totalWeight}
              selectedShipping={selectedShipping}
              onSelect={setSelectedShipping}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-primary" /> Pilih Metode Pembayaran
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors
                      ${selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio" name="payment"
                      checked={selectedPayment === pm.id}
                      onChange={() => setSelectedPayment(pm.id)}
                      className="accent-primary"
                    />
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={3} className="input-field"
                  placeholder="Catatan untuk penjual..."
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">Kembali</button>
                <button onClick={() => setStep(3)} disabled={!selectedPayment} className="btn-primary flex-1 py-3">
                  Lihat Ringkasan
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Summary ── */}
          {step === 3 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" /> Ringkasan Pesanan
              </h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product?.images?.[0] ? getImageUrl(item.product.images[0]) : getImageUrl(null)}
                      alt={item.product?.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = '/images/daging%20steak.jpg.jpeg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity}× {formatCurrency(item.product?.discount_price || item.product?.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">
                      {formatCurrency((item.product?.discount_price || item.product?.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping summary */}
              {selectedShipping && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <Package size={16} className="text-primary flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{selectedShipping.courier} {selectedShipping.service}</span>
                    <span className="text-gray-500 ml-2">· Est. {selectedShipping.etd} hari</span>
                  </div>
                  <span className="font-bold text-primary text-sm">{formatCurrency(shippingCost)}</span>
                </div>
              )}

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim ({selectedShipping?.courier} {selectedShipping?.service})</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">Kembali</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  ) : selectedPayment === 'midtrans' ? (
                    '💳 Bayar Sekarang'
                  ) : (
                    'Buat Pesanan'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar summary ── */}
        <div className="card p-4 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Ringkasan</h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span>{selectedShipping ? formatCurrency(shippingCost) : <span className="text-gray-400">-</span>}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {selectedShipping && (
            <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">Pengiriman:</p>
              <p>{selectedShipping.courier} {selectedShipping.service}</p>
              <p>Estimasi {selectedShipping.etd} hari</p>
            </div>
          )}

          {selectedAddress && (
            <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-0.5">
              <p className="font-medium text-gray-700">Kirim ke:</p>
              <p>{selectedAddress.recipient_name}</p>
              <p>{selectedAddress.city}, {selectedAddress.province}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
