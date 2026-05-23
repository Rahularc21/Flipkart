import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';
import { ShoppingBag, Eye, Calendar, Award, ChevronRight } from 'lucide-react';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.success) {
          // Sort orders by newest first
          const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sorted);
        }
      } catch (err) {
        console.error('Failed fetching order ledger:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader />;
  }

  // Visual status color mapping
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="text-[10px] uppercase font-bold text-success-green bg-emerald-50 px-2 py-1 rounded">Delivered ✔</span>;
      case 'cancelled':
        return <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Cancelled ✘</span>;
      case 'shipped':
        return <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">Shipped 🚚</span>;
      default:
        return <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Processing ⚡</span>;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center bg-white rounded border border-slate-100 shadow-3xs my-8 shrink-0 select-none animate-fade-in" id="empty-history-view">
        <div className="bg-slate-50 p-6 rounded-full text-slate-400 mb-4 animate-bounce">
          <ShoppingBag size={42} />
        </div>
        <h2 className="text-base md:text-lg font-bold text-dark-text font-sans">No Orders Placed Yet!</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium max-w-sm leading-normal">
          You haven't bought any items yet. Start adding gorgeous electronics or apparel to your bag now!
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="orders-dashboard">
      
      <h1 className="text-base md:text-lg font-bold text-dark-text mb-6">My Purchase History</h1>

      <div className="flex flex-col gap-4">
        {orders.map((ord) => {
          const itemsCount = ord.items?.reduce((acc, sub) => acc + (sub.quantity || 1), 0) || 0;
          return (
            <div 
              key={ord._id}
              className="bg-white border rounded shadow-3xs overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-6 hover:shadow-md transition duration-200"
            >
              
              {/* Col 1: Metadata summaries */}
              <div className="flex flex-col gap-1.5 text-xs font-sans min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2874F0] font-mono">{ord.orderId}</span>
                  {getStatusBadge(ord.status)}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 mt-1 font-medium select-none">
                  <Calendar size={13} />
                  <span>Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="font-bold text-dark-text text-sm md:text-base font-sans mt-2">
                  Total Payable: {formatPrice(ord.totalAmount)}
                </div>
              </div>

              {/* Col 2: Image Thumbnails strip */}
              <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar items-center py-1">
                {ord.items?.map((item, idx) => {
                  if (!item.product) return null;
                  return (
                    <div key={idx} className="relative group/thumb' h-12 w-12 border p-0.5 rounded-sm bg-white shrink-0 shadow-3xs hover:border-slate-300 transition select-none">
                      <img 
                        src={item.product.images?.[0] || 'https://picsum.photos/seed/thumb/50/50'} 
                        alt="" 
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[8px] font-bold px-1 rounded-sm">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Col 3: Details shortcut Link button */}
              <div className="shrink-0 flex items-center md:self-center self-end pt-2 md:pt-0">
                <button
                  onClick={() => navigate(`/orders/${ord._id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2874F0] hover:text-blue-600 uppercase border border-slate-150 px-5 py-2 hover:bg-slate-50 transition active:scale-95 cursor-pointer rounded-sm"
                >
                  <Eye size={14} /> Detail Summary
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
