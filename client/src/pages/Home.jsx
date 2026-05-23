import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { Clock, ChevronRight, Zap } from 'lucide-react';

const DEALS_SLIDES = [
  { title: 'Big Saving Days Are Live!', tagline: 'Save Up To 80% on Smart Mobiles & Gadgets', bg: 'from-blue-600 to-cyan-500' },
  { title: 'Best of Electronics Showcase', tagline: 'No Cost EMI starts from ₹999/month', bg: 'from-indigo-600 to-purple-500' },
  { title: 'Refurbish Your Space', tagline: 'Premium Furniture & Mattress starting at ₹2,499', bg: 'from-orange-500 to-amber-500' },
  { title: 'Unbelievable Appliance Deals', tagline: 'Extra ₹1,500 Bank Discount on checkout', bg: 'from-emerald-600 to-teal-500' },
  { title: 'Flipkart Global Beauty Sale', tagline: 'Flat 30% Off on Top Fragrances & Cosmetics', bg: 'from-rose-500 to-pink-500' }
];

export default function Home() {
  const navigate = useNavigate();

  // 1. Fetch products from custom hooks using categories filters
  const { data: electronicsData, isLoading: leadsLoading } = useProducts({ category: 'electronics', limit: 4 });
  const { data: mobilesData, isLoading: mobLoading } = useProducts({ category: 'mobiles', limit: 4 });
  const { data: suggestedData, isLoading: suggLoading } = useProducts({ limit: 4 }); // popularity sorted by default

  // 2. Countdown timer to Midnight
  const [timeLeft, setTimeLeft] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // Autoplay deals billboard
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % DEALS_SLIDES.length);
    }, 4000);

    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // midnight tonight
      
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const format = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${format(hours)}h : ${format(minutes)}m : ${format(seconds)}s Left`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(timerInterval);
    };
  }, []);

  if (leadsLoading || mobLoading || suggLoading) {
    return <Loader />;
  }

  const electronicsList = electronicsData?.products || [];
  const mobilesList = mobilesData?.products || [];
  const suggestedList = suggestedData?.products || [];

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8 max-w-7xl mx-auto pb-12 mt-4" id="home-page-viewport">
      
      {/* A. HERO BILLBOARD AUTOPLAY PROMO CAROUSEL */}
      <div className="relative w-full h-[180px] md:h-[280px] rounded overflow-hidden shadow-xs select-none">
        {DEALS_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-opacity duration-1000 flex flex-col justify-center px-8 md:px-16 text-white ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <h2 className="text-xl md:text-3.5xl font-bold font-sans tracking-tight drop-shadow-xs max-w-lg md:leading-tight animate-fade-in">
                {slide.title}
              </h2>
              <p className="text-xs md:text-sm text-yellow mt-2 font-medium drop-shadow-xs max-w-md">
                {slide.tagline}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 self-start rounded-xs bg-[#FB641B] px-5 py-2 font-bold text-[10px] md:text-xs text-white uppercase tracking-wider hover:bg-orange-600 transition active:translate-y-[1px] cursor-pointer shadow-md"
              >
                Shop Now
              </button>
            </div>
          );
        })}
        {/* Carousel indicator dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {DEALS_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === activeSlide ? 'bg-white w-4' : 'bg-white/50'}`}
              aria-label={`Go to slide ${idx}`}
            />
          ))}
        </div>
      </div>

      {/* B. CATEGORY GRID CARDS MAP */}
      <div className="bg-white rounded p-4 shadow-xs grid grid-cols-4 md:grid-cols-8 gap-4 justify-between">
        {[
          { name: 'Grocery', slug: 'grocery', img: 'https://picsum.photos/seed/grocery-banner/100/100' },
          { name: 'Mobiles', slug: 'mobiles', img: 'https://picsum.photos/seed/mobiles-banner/100/100' },
          { name: 'Fashion', slug: 'fashion', img: 'https://picsum.photos/seed/fashion-banner/100/100' },
          { name: 'Electronics', slug: 'electronics', img: 'https://picsum.photos/seed/electronics-banner/100/100' },
          { name: 'Laptops', slug: 'laptops', img: 'https://picsum.photos/seed/laptops-banner/100/100' },
          { name: 'Furniture', slug: 'home-furniture', img: 'https://picsum.photos/seed/home-furniture-banner/100/100' },
          { name: 'Appliances', slug: 'appliances', img: 'https://picsum.photos/seed/appliances-banner/100/100' },
          { name: 'Beauty Product', slug: 'beauty', img: 'https://picsum.photos/seed/beauty-banner/100/100' }
        ].map((cat) => (
          <button
            key={cat.slug}
            onClick={() => navigate(`/products?category=${cat.slug}`)}
            className="group flex flex-col items-center gap-1.5 hover:scale-105 transition duration-200 cursor-pointer text-center"
          >
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-xs bg-slate-50 flex items-center justify-center">
              <img src={cat.img} alt={cat.name} className="h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[11px] md:text-xs font-bold text-slate-700 leading-tight group-hover:text-primary">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* C. DEAL OF THE DAY (Timer-driven countdown + row list) */}
      <div className="bg-white rounded shadow-xs overflow-hidden flex flex-col">
        <div className="bg-white py-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base md:text-lg font-bold text-dark-text tracking-tight flex items-center gap-1.5 leading-none">
              <Zap size={18} className="text-action-orange fill-action-orange" />
              Deal of the Day
            </h3>
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold px-2.5 py-1 rounded-sm text-xs md:text-sm font-mono leading-none">
              <Clock size={14} />
              <span>{timeLeft}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold rounded-xs px-4 py-1.5 text-xs text-center uppercase shadow-xs transition cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/50">
          {mobilesList.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </div>

      {/* D. BEST OF ELECTRONICS */}
      <div className="bg-white rounded shadow-xs overflow-hidden flex flex-col">
        <div className="py-4 px-6 border-b border-slate-100 flex items-center justify-between pb-3">
          <h3 className="text-base md:text-lg font-bold text-dark-text tracking-tight flex items-center gap-1.5">
            Best of Electronics
          </h3>
          <button
            onClick={() => navigate('/products?category=electronics')}
            className="text-primary hover:text-blue-600 font-bold text-xs flex items-center gap-0.5"
          >
            Explore More <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5">
          {electronicsList.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </div>

      {/* E. SUGGESTED FOR YOU (Bento grids fallback or rows) */}
      <div className="bg-white rounded shadow-xs overflow-hidden flex flex-col">
        <div className="py-4 px-6 border-b border-slate-100 flex items-center justify-between pb-3">
          <h3 className="text-base md:text-lg font-bold text-dark-text tracking-tight">
            Suggested for You
          </h3>
          <button
            onClick={() => navigate('/products')}
            className="text-primary hover:text-blue-600 font-bold text-xs flex items-center gap-0.5"
          >
            Explore More <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/50">
          {suggestedList.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </div>

    </div>
  );
}
