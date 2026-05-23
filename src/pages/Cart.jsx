import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';
import { Trash2, Heart, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items: cartItems, cartTotal, removeFromCart, updateQty, loading } = useCart();

  const handleIncrement = (itemId, currentQty, stockLimit) => {
    if (currentQty >= stockLimit) {
      toast.error(`Apologies, only ${stockLimit} units are currently available.`);
      return;
    }
    updateQty(itemId, currentQty + 1);
  };

  const handleDecrement = (itemId, currentQty) => {
    if (currentQty <= 1) {
      if (window.confirm('Delete this product from your shopping Cart?')) {
        removeFromCart(itemId);
      }
      return;
    }
    updateQty(itemId, currentQty - 1);
  };

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  const originalGrandTotal = cartItems.reduce((acc, sub) => acc + ((sub.product?.originalPrice || sub.price) * sub.quantity), 0);
  const totalDiscount = originalGrandTotal - cartTotal;

  if (loading) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center bg-white rounded border border-slate-100 shadow-3xs my-8 shrink-0 select-none animate-fade-in" id="empty-cart-view">
        <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4 animate-bounce">
          <ShoppingBag size={42} />
        </div>
        <h2 className="text-base md:text-lg font-bold text-dark-text font-sans">Your Cart is Empty!</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium max-w-sm leading-normal">
          Explore our trending catalogues and map stunning products to purchase immediately!
        </p>
        <Link 
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xs bg-[#2874F0] px-8 py-2.5 font-bold text-white text-xs uppercase shadow-xs hover:bg-blue-600 transition tracking-wider active:scale-95 cursor-pointer"
        >
          Check Today's Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="cart-workspace">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <main className="md:col-span-2 flex flex-col gap-4">
          
          <div className="bg-white border border-slate-100 rounded shadow-3xs">
            <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/20">
              <span className="font-bold text-slate-800 text-sm md:text-base font-sans">
                Shopping Flip-Cart ({cartItems.length} items)
              </span>
              <span className="text-xs text-slate-400 font-bold font-sans">Assured Quality items</span>
            </div>

            <div className="divide-y divide-slate-100 leading-normal font-sans">
              {cartItems.map((item) => {
                if (!item.product) return null;
                const prod = item.product;
                const imageSource = prod.images?.[0] || 'https://picsum.photos/seed/cart/100/100';

                return (
                  <div key={item._id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-5">
                    
                    <div className="flex flex-col items-center gap-3 shrink-0 self-center sm:self-start">
                      <div className="h-[90px] w-[90px] border p-1 rounded-sm bg-white overflow-hidden aspect-square flex items-center justify-center">
                        <img src={imageSource} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex items-center gap-1.5 border border-slate-200 p-1 bg-white shadow-3xs rounded-xs">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item._id, item.quantity)}
                          className="h-5 w-5 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition active:scale-90 cursor-pointer rounded-xs"
                          aria-label="Decrement unit"
                        >
                          <Minus size={11} className="stroke-[3]" />
                        </button>
                        <span className="w-8 font-mono font-bold text-center text-xs select-none">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item._id, item.quantity, prod.stock)}
                          className="h-5 w-5 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition active:scale-90 cursor-pointer rounded-xs"
                          aria-label="Increment unit"
                        >
                          <Plus size={11} className="stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 select-none">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">{prod.brand}</span>
                      <Link 
                        to={`/products/${prod._id}`}
                        className="text-xs md:text-sm font-semibold text-slate-800 hover:text-[#2874F0] leading-snug line-clamp-2"
                      >
                        {prod.title}
                      </Link>

                      <div className="mt-2.5 flex items-baseline flex-wrap gap-2">
                        <span className="text-sm md:text-base font-bold text-slate-800">{formatPrice(item.price)}</span>
                        <span className="text-xs text-slate-400 line-through font-semibold">{formatPrice(prod.originalPrice || item.price)}</span>
                        <span className="text-xs font-bold text-success-green">{prod.discount}% off</span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-4">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-xs font-bold text-slate-500 hover:text-rose-500 uppercase flex items-center gap-1 cursor-pointer transition py-1 px-2 hover:bg-slate-50 rounded"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={handleProceedCheckout}
                className="py-3 px-8 rounded-sm bg-[#FB641B] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition select-none active:translate-y-[1px] cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>

        </main>

        <aside className="md:col-span-1 flex flex-col gap-4">
          
          <div className="bg-white border border-slate-100 rounded shadow-3xs p-5 font-sans">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2.5 leading-none">
              Price Details Summary
            </h3>

            <div className="flex flex-col gap-3 mt-4 text-xs font-sans text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Price ({cartItems.length} items)</span>
                <span className="font-mono text-slate-800">{formatPrice(originalGrandTotal)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Discount</span>
                <span className="font-mono text-success-green">- {formatPrice(totalDiscount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Delivery Charges</span>
                <span className="text-success-green">FREE</span>
              </div>
              <hr className="border-slate-100 my-1" />
              <div className="flex justify-between text-slate-800 text-sm font-bold">
                <span>Total Amount Payable</span>
                <span className="font-mono text-slate-900 text-base">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="mt-5 bg-emerald-50/50 p-3 rounded border border-emerald-100 text-center flex items-center justify-center gap-1 text-[11px] font-bold text-success-green font-sans leading-none">
              <span>🎉 You will save {formatPrice(totalDiscount)} on this transaction</span>
            </div>
          </div>

          <div className="p-4 border border-dashed rounded bg-slate-50 flex items-center gap-2.5 text-slate-400 select-none">
            <ShieldCheck size={28} className="text-slate-400 shrink-0" />
            <p className="text-[10px] leading-relaxed font-sans text-slate-400">
              Safe and Secure Checkout. Since customer transactions are subject to internal audit, details of operations and invoice lists are compiled securely.
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
}
