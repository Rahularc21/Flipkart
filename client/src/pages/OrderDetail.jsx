import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';
import { ShoppingBag, ArrowLeft, Calendar, User, Phone, MapPin, XOctagon, Receipt, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.success) {
          setOrder(res.data);
        } else {
          toast.error(res.message || 'Unable to retrieve order transactional records.');
          navigate('/orders');
        }
      } catch (err) {
        console.error('Failed fetching order invoice:', err.message);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you absolutely sure you want to cancel this order? This action is irreversible.')) {
      return;
    }

    setCancelLoading(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.success) {
        toast.success(res.message || 'Order was cancelled successfully.');
        setOrder(prev => {
          if (!prev) return null;
          return { ...prev, status: 'Cancelled' };
        });
      } else {
        toast.error(res.message || 'Unable to cancel this order.');
      }
    } catch (err) {
      toast.error(err.message || 'Connecting failure.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!order) {
    return null;
  }

  // Visual status mapping helper
  const getStatusLabelColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-success-green bg-emerald-50 border-success-green';
      case 'cancelled':
        return 'text-rose-500 bg-rose-100/50 border-rose-300';
      case 'shipped':
        return 'text-sky-600 bg-sky-55/40 border-sky-300';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  const address = order.shippingAddress || {};
  const isCancellable = order.status && order.status.toLowerCase() === 'placed';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="order-invoice-details">
      
      {/* 1. HEADER SHORTCUT navigation */}
      <div className="flex items-center gap-3.5 mb-6 select-none font-sans uppercase tracking-widest text-xs">
        <button 
          onClick={() => navigate('/orders')} 
          className="flex items-center gap-1.5 font-bold text-[#2874F0] hover:text-blue-600 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to History
        </button>
      </div>

      <div className="bg-white border rounded shadow-3xs overflow-hidden flex flex-col gap-6">
        
        {/* Invoice Title Ribbon */}
        <div className="bg-slate-50/70 p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-[#878787] font-bold uppercase tracking-widest text-[9px]">Receipt Overview</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-sm md:text-base text-slate-800 font-mono">{order.orderId}</span>
              <span className={`text-[10px] font-bold uppercase py-0.5 px-2.5 rounded border ${getStatusLabelColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 self-start sm:self-center font-sans">
            <Calendar size={13} />
            <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 2-Column Info Grid panel */}
        <div className="px-5 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b">
          
          {/* Col 1 Shipping address details */}
          <div className="flex flex-col gap-3 text-xs text-slate-700">
            <h3 className="font-bold text-dark-text tracking-wider uppercase text-[10px] text-slate-400 flex items-center gap-1.5 pb-2 border-b">
              <MapPin size={14} className="text-primary" /> Delivery Destination Address
            </h3>
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-slate-800">{address.name}</span>
              <span className="text-slate-500 font-medium">{address.street}</span>
              <span className="text-slate-500 font-medium">{address.city}, {address.state} - <strong>{address.pincode}</strong></span>
              <div className="mt-2 text-[11px] font-sans font-semibold text-slate-800 flex items-center gap-1">
                <Phone size={11} className="text-slate-400" /> Phone: {address.phone} {address.alternatePhone && `| Alt: ${address.alternatePhone}`}
              </div>
            </div>
          </div>

          {/* Col 2 Price details calculation summary */}
          <div className="flex flex-col gap-3 text-xs text-slate-700 font-sans">
            <h3 className="font-bold text-dark-text tracking-wider uppercase text-[10px] text-slate-400 flex items-center gap-1.5 pb-2 border-b">
              <Receipt size={14} className="text-[#388E3C]" /> Invoice & Payments
            </h3>
            <div className="flex flex-col gap-2 pt-0.5">
              <div className="flex justify-between font-semibold">
                <span>Payment Mode</span>
                <span className="uppercase text-slate-800 font-bold">{order.paymentMethod || 'COD'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Shipping Fee</span>
                <span className="text-success-green">FREE</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between font-bold text-sm text-dark-text">
                <span>Total Charge Amount</span>
                <span className="font-mono text-slate-900">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. LIST OF SHIPPED ITEMS COMPONENT */}
        <div className="px-5 md:px-6 flex flex-col gap-3">
          <h3 className="font-bold text-dark-text tracking-wider uppercase text-[10px] text-slate-400 flex items-center gap-1.5 pb-2 border-b">
            <Receipt size={14} className="text-primary" /> Purchased Items ({order.items?.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item, index) => {
              if (!item.product) return null;
              return (
                <div key={index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
                  
                  {/* Summary row */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.images?.[0] || 'https://picsum.photos/seed/inv-thum/60/60'}
                      alt=""
                      className="h-12 w-12 object-contain border rounded-sm p-0.5 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col gap-0.5">
                      <Link 
                        to={`/products/${item.product._id}`}
                        className="font-semibold text-[#2874F0] hover:underline leading-tight"
                      >
                        {item.product.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Manufacturer: {item.product.brand}</span>
                    </div>
                  </div>

                  {/* Calculations row */}
                  <div className="flex items-baseline gap-6 sm:self-center self-end pt-1 sm:pt-0">
                    <span className="text-slate-400 font-semibold">{item.quantity} x {formatPrice(item.price)}</span>
                    <span className="font-bold font-mono text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 4. ACTIVE ORDER CANCELLATION GATE FOOTER PANEL */}
        {isCancellable && (
          <div className="bg-rose-50/50 p-5 md:p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1 text-xs select-none">
              <span className="font-bold text-rose-700 flex items-center gap-1.5">
                <XOctagon size={15} /> Order Cancellation is Active
              </span>
              <p className="text-slate-400 font-sans mt-0.5 font-medium leading-relaxed max-w-md">
                This item has not left our regional distribution hub yet. You may decline shipment and revoke your order immediately using the cancel tool.
              </p>
            </div>
            <button
              disabled={cancelLoading}
              onClick={handleCancelOrder}
              className="py-2.5 px-6 rounded-sm bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider transition active:translate-y-[1px] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {cancelLoading ? 'Cancelling records...' : 'Revoke & Cancel Order'}
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
