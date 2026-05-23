import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, cartTotal, cartCount, updateQty, removeFromCart } = useCart();

  const handleQtyChange = (itemId, currentQty, delta) => {
    const nextQty = currentQty + delta;
    updateQty(itemId, nextQty);
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart has no products to proceed.');
      return;
    }
    navigate('/checkout');
  };

  // Compute mock discount parameters for Flipkart-style Price Details display
  // We assume a standard MRP baseline which is 25% higher than purchase cost
  const grossMRP = Math.round(cartTotal * 1.25);
  const discountTotal = grossMRP - cartTotal;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center bg-white rounded border border-slate-100 shadow-3xs my-8 shrink-0 select-none" id="empty-cart-view">
        <div className="bg-blue-50/70 p-6 rounded-full text-primary mb-4 animate-bounce">
          <ShoppingBag size={42} />
        </div>
        <h2 className="text-base md:text-lg font-bold text-dark-text font-sans">Your Cart is Empty!</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium max-w-sm leading-normal">
          Explore our wide range of mobiles, laptops, premium fashion and cosmetics today!
        </p>
        <Link 
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xs bg-[#2874F0] px-8 py-2.5 font-bold text-white text-xs uppercase shadow-xs hover:bg-blue-600 transition tracking-wider active:scale-95 cursor-pointer"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none" id="cart-workspace">
      
      <h1 className="text-base md:text-lg font-bold text-dark-text mb-6">Shopping Cart ({cartCount} Items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* A. LEFT COLUMN: ITEMS VIEW (col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-white border border-slate-100 rounded shadow-3xs divide-y divide-slate-100">
          
          {items.map((item) => {
            if (!item.product) return null;
            const productSlug = item.product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const imgSource = item.product.images?.[0] || `https://picsum.photos/seed/${item.product._id}/100/100`;

            return (
              <div key={item._id || item.product._id} className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                
                {/* Thumb grid */}
                <div className="flex items-center justify-center p-2 border border-slate-100 rounded-sm bg-white aspect-square h-24 w-24 sm:mx-0 mx-auto overflow-hidden">
                  <img src={imgSource} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                </div>

                {/* Details grid */}
                <div className="sm:col-span-2 flex flex-col flex-grow text-center sm:text-left">
                  <span className="text-xs text-muted-text font-bold uppercase tracking-wider">{item.product.brand}</span>
                  <Link 
                    to={`/products/${item.product._id}`}
                    className="mt-0.5 text-xs md:text-sm font-medium text-slate-800 leading-snug hover:text-primary transition line-clamp-2"
                  >
                    {item.product.title}
                  </Link>
                  
                  {/* Assured logo */}
                  <div className="mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="bg-[#388E3C] text-white font-extrabold text-[9px] px-1 py-0.5 rounded leading-none">
                      {item.product.ratings?.average || 4.1}★
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold font-sans">Assured Verified Product</span>
                  </div>

                  {/* Pricing row */}
                  <div className="mt-3.5 flex items-baseline justify-center sm:justify-start flex-wrap gap-2">
                    <span className="text-sm font-bold text-dark-text">{formatPrice(item.price)}</span>
                    <span className="text-xs text-slate-400 line-through font-semibold">{formatPrice(item.product.originalPrice)}</span>
                    <span className="text-xs font-bold text-success-green">{item.product.discount}% Off</span>
                  </div>
                </div>

                {/* Steppers & Operations grid */}
                <div className="flex flex-col items-center gap-4">
                  
                  <div className="flex items-center gap-1">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => handleQtyChange(item.product._id, item.quantity, -1)}
                      className="h-7 w-7 border border-slate-200 rounded-full flex items-center justify-center text-xs font-extrabold text-slate-600 bg-slate-50 hover:bg-slate-100 transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-dark-text">{item.quantity}</span>
                    <button
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => handleQtyChange(item.product._id, item.quantity, 1)}
                      className="h-7 w-7 border border-slate-200 rounded-full flex items-center justify-center text-xs font-extrabold text-slate-600 bg-slate-50 hover:bg-slate-100 transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase flex items-center gap-1 py-1.5 focus:outline-none transition hover:scale-105 cursor-pointer"
                  >
                    <Trash2 size={13} /> Remove
                  </button>

                </div>

              </div>
            );
          })}

        </div>

        {/* B. RIGHT COLUMN: PRICING CARD SUMMARY (col span 1) */}
        <div className="lg:col-span-1 h-fit sticky top-24">
          <div className="bg-white border border-slate-100 p-5 rounded shadow-3xs flex flex-col gap-4 font-sans uppercase tracking-wider">
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

            <div className="flex justify-between items-center text-sm md:text-base font-bold text-dark-text uppercase">
              <span>Total Amount</span>
              <span className="font-mono">{formatPrice(cartTotal)}</span>
            </div>

            <hr className="border-slate-100" />
            
            <p className="text-[10px] text-slate-400 leading-normal lowercase text-center normal-case select-none">
              Invoices and order confirmation details will be sent directly to your registered mailbox.
            </p>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-[#FB641B] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xs transition shadow-xs hover:shadow-md cursor-pointer text-center select-none active:translate-y-[1px] flex items-center justify-center gap-1"
            >
              <span>Place Order</span>
              <ArrowRight size={14} />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
