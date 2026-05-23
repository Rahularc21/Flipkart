import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import { CheckCircle2, MapPin, CreditCard, ShoppingBag, Eye, User, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, addAddress } = useAuth();
  const { items, cartTotal, cartCount, clearCart } = useCart();

  // Step state tracker: 1=Login, 2=Address, 3=OrderSummary, 4=Payment
  const [activeStep, setActiveStep] = useState(2); 

  // Address fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Address Selection Cache
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Indian Pincode Auto-map trigger
  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const start = pincode.substring(0, 2);
      if (start === '11') {
        setCity('New Delhi');
        setStateName('Delhi');
      } else if (start === '40') {
        setCity('Mumbai');
        setStateName('Maharashtra');
      } else if (start === '56') {
        setCity('Bengaluru');
        setStateName('Karnataka');
      } else if (start === '60') {
        setCity('Chennai');
        setStateName('Tamil Nadu');
      } else if (start === '70') {
        setCity('Kolkata');
        setStateName('West Bengal');
      } else {
        setCity('Mumbai');
        setStateName('Maharashtra');
      }
    }
  }, [pincode]);

  // If cart empty, redirect
  useEffect(() => {
    if (items.length === 0 && activeStep !== 5) {
      toast.error('Add products to your cart before checking out.');
      navigate('/');
    }
  }, [items, navigate]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !streetAddress || !pincode || !city || !stateName) {
      toast.error('All address fields are required.');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    const compiledAddress = {
      name: fullName,
      phone,
      street: streetAddress,
      city,
      state: stateName,
      pincode,
      alternatePhone
    };

    const res = await addAddress(compiledAddress);
    if (res.success) {
      toast.success('Address saved successfully!');
      setSelectedAddress(compiledAddress);
      setActiveStep(3); // unlock next summarization step
    } else {
      toast.error(res.message);
    }
  };

  const handleOrderSubmission = async () => {
    if (!selectedAddress) {
      toast.error('Please configure your Delivery Address to proceed.');
      setActiveStep(2);
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post('/orders', {
        shippingAddress: selectedAddress,
        paymentMethod
      });

      if (res.success) {
        toast.success('Order placed successfully! Transaction record saved.');
        clearCart(); // Clear active client bag
        
        // Navigation redirect carrying receipt properties
        navigate(`/order-confirm?orderId=${res.data.orderId}&deliveryDate=Estimated in 3 days`);
      } else {
        toast.error(res.message || 'Operation failed. Stock status changed.');
      }
    } catch (err) {
      toast.error(err.message || 'Error processing purchase order on central endpoints.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const grossMRP = Math.round(cartTotal * 1.25);
  const discountTotal = grossMRP - cartTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="checkout-workspace">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* A. LEFT SIDE: WIZARD STEPS WINDOW (col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* STEP 1: LOGIN STATUS SECURED INDICATOR */}
          <div className="bg-white border rounded shadow-3xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 bg-success-green text-white font-black rounded-full flex items-center justify-center text-xs">✔</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">1. Login Profile</span>
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono">Jane ({user?.email})</span>
            </div>
          </div>

          {/* STEP 2: ADDRESS SELECTION AND AUTO-MAP FORM PANEL */}
          <div className={`bg-white border rounded shadow-3xs overflow-hidden transition-all duration-300 ${activeStep === 2 ? 'ring-1 ring-primary' : ''}`}>
            
            {/* Collapsed view status heading */}
            <div 
              onClick={() => setSelectedAddress(null) || setActiveStep(2)}
              className="bg-[#2874F0] text-white p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 bg-white text-primary font-bold rounded-full flex items-center justify-center text-xs">2</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Delivery Address Config</span>
              </div>
              {selectedAddress && (
                <span className="text-xs font-bold underline cursor-pointer">Modify</span>
              )}
            </div>

            {/* Expanded address forms block */}
            {activeStep === 2 && (
              <form onSubmit={handleSaveAddress} className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={12} /> Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="p-2 border rounded text-xs select-none outline-none focus:border-primary"
                  />
                </div>

                {/* Primary phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Phone size={12} /> Contact Mobile (10-Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="p-2 border rounded font-mono text-xs select-none outline-none focus:border-primary"
                  />
                </div>

                {/* Street address */}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={12} /> Street, Apartment / House No.
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="p-2 border rounded text-xs select-none outline-none focus:border-primary"
                  />
                </div>

                {/* Pincode Indian mapper */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    6-Digit Postal Code (Pincode)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560001 ( Bengaluru )"
                    className="p-2 border rounded font-mono text-xs select-none outline-none focus:border-primary"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">City / District</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="p-2 border rounded text-xs bg-slate-50 select-none outline-none focus:border-primary"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">State Name</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="p-2 border rounded text-xs bg-slate-50 select-none outline-none focus:border-primary"
                  />
                </div>

                {/* Alternate phone option */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Alternate Mobile</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="p-2 border rounded font-mono text-xs select-none outline-none focus:border-primary"
                  />
                </div>

                {/* Submit addresses */}
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-sm bg-[#FB641B] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition hover:shadow-md cursor-pointer active:translate-y-[1px]"
                  >
                    Save & Deliver Here
                  </button>
                </div>

              </form>
            )}

            {/* Display cache summary when collapsed */}
            {selectedAddress && (
              <div className="p-4 bg-slate-50/50 border-t flex flex-col sm:flex-row items-start gap-4 text-xs select-none font-sans">
                <Check className="text-[#388E3C] mt-0.5 shrink-0" size={16} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800">{selectedAddress.name} ({selectedAddress.phone})</span>
                  <span className="text-slate-500 leading-normal font-medium">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: ORDER SUMMARY REVIEWS */}
          <div className={`bg-white border rounded shadow-3xs overflow-hidden transition-all duration-300 ${activeStep === 3 ? 'ring-1 ring-primary' : ''}`}>
            
            <div className="bg-slate-100 p-4 border-b flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 bg-slate-400 text-white font-bold rounded-full flex items-center justify-center text-xs">3</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">3. Order Summary review</span>
              </div>
              {selectedAddress && activeStep > 3 && (
                <Check className="text-[#388E3C]" size={16} />
              )}
            </div>

            {activeStep === 3 && (
              <div className="p-4 flex flex-col divide-y divide-slate-100 select-none">
                
                {items.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                    <img
                      src={item.product?.images?.[0] || 'https://picsum.photos/seed/prod-tag/60/60'}
                      alt=""
                      className="h-10 w-10 object-contain border p-0.5 rounded-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 leading-tight line-clamp-1">{item.product?.title}</h4>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-sans font-medium uppercase tracking-wider">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold font-mono text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="mt-4 self-end rounded-xs bg-[#2874F0] hover:bg-blue-600 px-8 py-2.5 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Continue to Payments
                </button>

              </div>
            )}
          </div>

          {/* STEP 4: PAYMENT OPTIONS CONFIGS */}
          <div className={`bg-white border rounded shadow-3xs overflow-hidden transition-all duration-300 ${activeStep === 4 ? 'ring-1 ring-primary' : ''}`}>
            
            <div className="bg-slate-100 p-4 border-b flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 bg-slate-400 text-white font-bold rounded-full flex items-center justify-center text-xs">4</span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider">4. Payment Options</span>
              </div>
            </div>

            {activeStep === 4 && (
              <div className="p-5 flex flex-col gap-4">
                
                {/* Method selection list */}
                <div className="flex flex-col border rounded divide-y divide-slate-100 overflow-hidden text-xs">
                  
                  {/* COD */}
                  <label className="flex items-center gap-3 p-4 hover:bg-slate-50/50 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="pay-op"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="h-4 w-4 text-primary focus:ring-blue-100"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">Cash On Delivery (COD)</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">Standard handling included. Try digital payment for super fast processing.</span>
                    </div>
                  </label>

                  {/* Netbanking simulator */}
                  <label className="flex items-center gap-3 p-4 hover:bg-slate-50/50 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="pay-op"
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                      className="h-4 w-4 text-primary focus:ring-blue-100"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">Mock Card Transactions</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">Simulate dynamic Debit or Credit payment confirmations safe & offline.</span>
                    </div>
                  </label>

                </div>

                {/* Submission Order Trigger CTA */}
                <button
                  onClick={handleOrderSubmission}
                  disabled={submitLoading}
                  className="w-full sm:w-fit sm:self-end py-3 px-12 bg-[#FB641B] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs shadow-xs transition active:translate-y-[1px] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  {submitLoading ? 'Registering Purchase State...' : 'CONFIRM ORDER'}
                </button>

              </div>
            )}
          </div>

        </div>

        {/* B. RIGHT SIDE: PRICE BILLING SUMMARY COLUMN (col span 1) */}
        <div className="lg:col-span-1 h-fit sticky top-24">
          <div className="bg-white border rounded shadow-3xs p-5 flex flex-col gap-4 font-sans uppercase tracking-wider">
            <h3 className="text-xs font-extrabold text-slate-400 tracking-widest border-b pb-2">Price Details</h3>
            
            <div className="flex flex-col gap-2.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between items-center">
                <span>Price ({cartCount} Items)</span>
                <span className="font-medium text-slate-900 font-mono">{formatPrice(grossMRP)}</span>
              </div>
              <div className="flex justify-between items-center text-[#388E3C] font-semibold">
                <span>Discount Total</span>
                <span className="font-mono">- {formatPrice(discountTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[#388E3C] font-semibold">
                <span>Delivery Charges</span>
                <span>FREE</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between items-center text-sm md:text-base font-bold text-dark-text">
              <span>Total Payable</span>
              <span className="font-mono">{formatPrice(cartTotal)}</span>
            </div>
            
            <hr className="border-slate-100" />

            <div className="text-[10px] text-[#388E3C] font-semibold normal-case text-center select-none leading-normal">
              ✔ You will save {formatPrice(discountTotal)} on this purchase order!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
