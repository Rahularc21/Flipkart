import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || 'FK-847291048';
  
  // Predict standard delivery date as today + 3 days
  const deliveryEstimate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center bg-white rounded border border-slate-100 shadow-3xs my-12 select-none animate-fade-in" id="order-confirm-workspace">
      
      {/* Visual Stroke checkmark animation */}
      <div className="text-success-green animate-bounce mb-6">
        <CheckCircle2 size={68} className="stroke-[1.5]" />
      </div>

      <h1 className="text-base md:text-2xl font-black text-dark-text tracking-tight font-sans">
        Order Placed Successfully!
      </h1>
      
      <p className="mt-3.5 text-xs text-slate-500 font-sans leading-relaxed max-w-sm">
        We have processed your transaction. Your order will be dispatched from our regional hub shortly.
      </p>

      {/* Structured details card */}
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-md w-full max-w-sm my-6 text-left flex flex-col gap-2 text-xs font-sans">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order ID</span>
          <span className="font-extrabold text-[#2874F0] font-mono">{orderId}</span>
        </div>
        <div className="flex justify-between items-start pt-1.5 leading-normal">
          <span className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Expected Delivery</span>
          <span className="font-bold text-[#388E3C] text-right">{deliveryEstimate()}</span>
        </div>
        <div className="flex justify-between items-start pt-1 leading-normal">
          <span className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Payment Status</span>
          <span className="font-bold text-slate-700 text-right uppercase">Pending / COD</span>
        </div>
      </div>

      <span className="text-[10px] text-slate-400 leading-snug normal-case">
        A detailed summary invoice is being prepared and will be sent to your inbox.
      </span>

      {/* Operational buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-8">
        <button
          onClick={() => navigate('/orders')}
          className="w-full py-2.5 rounded-sm bg-white border border-[#2874F0] text-[#2874F0] font-bold text-xs uppercase tracking-wider hover:bg-blue-50/50 transition cursor-pointer select-none active:translate-y-[1px]"
        >
          My Orders History
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 rounded-sm bg-[#FB641B] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition select-none active:translate-y-[1px]"
        >
          Continue Shopping
        </button>
      </div>

    </div>
  );
}
