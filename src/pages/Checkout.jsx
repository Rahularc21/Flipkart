import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';
import { MapPin, User, Phone, CheckCircle, CreditCard, ShoppingCart } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, addAddress } = useAuth();
  const { items: cartItems, cartTotal, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState(user?.addresses?.[0] || {
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    alternatePhone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Error validations states
  const [addressErrors, setAddressErrors] = useState({});

  const validateAddress = () => {
    const errs = {};
    if (!shippingAddress.name) errs.name = 'Contact Name is required.';
    if (!shippingAddress.phone || shippingAddress.phone.length < 10) {
      errs.phone = '10-digit primary phone contact is required.';
    }
    if (!shippingAddress.street) errs.street = 'Street address details are required.';
    if (!shippingAddress.city) errs.city = 'City is required.';
    if (!shippingAddress.state) errs.state = 'State option is required.';
    if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) {
      errs.pincode = '6-digit valid Pincode is required.';
    }
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateAddress()) {
      toast.error('Please fix address fields errors before submitting orders.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Save or associate address if new 
      if (!user?.addresses?.length) {
        await addAddress(shippingAddress);
      }

      // 2. Transact Order placement 
      const res = await api.post('/orders', {
        shippingAddress,
        paymentMethod
      });

      if (res.success) {
        toast.success(res.message || 'Deal confirmed!');
        clearCart();
        navigate(`/order-confirm?orderId=${res.data.orderId}`);
      } else {
        toast.error(res.message || 'Transacting failure. Order could not be placed.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed placing order.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center select-none" id="empty-checkout-gateway">
        <h3 className="text-sm font-semibold text-slate-500">Checkout is inactive. You carrying an empty cart sheet.</h3>
        <button onClick={() => navigate('/')} className="mt-4 bg-[#2874F0] text-white font-bold text-xs py-2 px-5 rounded">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="checkout-view-screen">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form panel column */}
        <form onSubmit={handlePlaceOrder} className="md:col-span-2 flex flex-col gap-5">
          
          {/* STEP 1 SHIPPING ADDRESS */}
          <div className="bg-white border border-slate-100 rounded shadow-3xs p-5 flex flex-col gap-4">
            
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 pb-2 border-b">
              <MapPin size={15} className="text-primary" /> Delivery Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">Recipient Name</label>
                <input
                  type="text"
                  placeholder="Enter contact name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs focus:border-[#2874F0]"
                />
                {addressErrors.name && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.name}</span>}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">Primary Phone Contact</label>
                <input
                  type="text"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs font-mono focus:border-[#2874F0]"
                />
                {addressErrors.phone && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.phone}</span>}
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">Street / Apartment / House detail</label>
                <input
                  type="text"
                  placeholder="Enter street lane complete addresses"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs focus:border-[#2874F0]"
                />
                {addressErrors.street && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.street}</span>}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">City</label>
                <input
                  type="text"
                  placeholder="Enter City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs focus:border-[#2874F0]"
                />
                {addressErrors.city && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.city}</span>}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">State</label>
                <input
                  type="text"
                  placeholder="Enter State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs focus:border-[#2874F0]"
                />
                {addressErrors.state && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.state}</span>}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">6-digit Postal Pincode</label>
                <input
                  type="text"
                  placeholder="Enter PIN"
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs font-mono focus:border-[#2874F0]"
                />
                {addressErrors.pincode && <span className="text-[10px] text-rose-500 font-semibold">{addressErrors.pincode}</span>}
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-slate-500 text-[10px] uppercase">Alt Phone Contact (Optional)</label>
                <input
                  type="text"
                  placeholder="Alternate Contact number"
                  maxLength={10}
                  value={shippingAddress.alternatePhone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, alternatePhone: e.target.value })}
                  className="w-full p-2.5 border rounded outline-none text-xs font-mono focus:border-[#2874F0]"
                />
              </div>

            </div>

          </div>

          {/* STEP 2 PAYMENT METHOD */}
          <div className="bg-white border border-slate-100 rounded shadow-3xs p-5 flex flex-col gap-4">
            
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 pb-2 border-b">
              <CreditCard size={15} className="text-success-green" /> Payment Gateway Mode Selection
            </h2>

            <div className="flex flex-col gap-3 font-sans pt-1">
              
              <label className="flex items-center gap-3 p-3 border rounded border-slate-200 cursor-pointer hover:bg-slate-50 transition select-none">
                <input
                  type="radio"
                  name="pmode"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="h-4 w-4 text-primary"
                />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-bold text-slate-800">Cash on Delivery (COD)</span>
                  <span className="text-slate-400 text-[10px]">Zero extra processing charges. Pay immediately on delivery checklist logs verified.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded border-slate-200 cursor-pointer opacity-60 cursor-not-allowed select-none">
                <input
                  type="radio"
                  name="pmode"
                  disabled
                  checked={paymentMethod === 'CARD'}
                  className="h-4 w-4 text-slate-300"
                />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-bold text-slate-400">Debit / Credit / ATM Cards (Online portal closed)</span>
                  <span className="text-rose-400 text-[9px] font-semibold uppercase">Currently inactive in Sandbox preview testbed. Use Cash On Delivery.</span>
                </div>
              </label>

            </div>

          </div>

        </form>

        {/* Aside columns price summaries */}
        <aside className="md:col-span-1 flex flex-col gap-4">
          
          <div className="bg-white border rounded shadow-3xs p-5 font-sans leading-normal">
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 leading-none mb-4 flex items-center gap-1">
              <ShoppingCart size={14} className="text-primary" /> Cart Summary ({cartItems.length} Products)
            </h3>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-2">
                  <span className="font-semibold text-slate-700 line-clamp-1 flex-1 leading-snug">{item.product?.title}</span>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider font-sans pr-1">x{item.quantity}</span>
                  <span className="font-bold font-mono text-slate-800 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="my-3 text-slate-200" />

            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
              <div className="flex justify-between font-semibold">
                <span>Shipping Fees</span>
                <span className="text-success-green">FREE</span>
              </div>
              <div className="flex justify-between text-sm text-slate-800 font-bold mt-1">
                <span>Total Amount Due</span>
                <span className="font-mono text-slate-900 text-base">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button
              disabled={checkoutLoading}
              onClick={handlePlaceOrder}
              className="w-full mt-6 py-3.5 rounded bg-[#FB641B] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-sm shadow-md transition active:translate-y-[1px] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={15} /> {checkoutLoading ? 'COMMITTING TRANSACTION...' : 'CONFIRM PLACE ORDER'}
            </button>

          </div>

        </aside>

      </div>

    </div>
  );
}
