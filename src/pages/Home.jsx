import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Clock, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  ArrowRight,
  TrendingUp, 
  ShoppingBag,
  Percent,
  Compass
} from 'lucide-react';

const DEALS_SLIDES = [
  { title: 'Big Saving Days Are Live!', tagline: 'Save Up To 80% on Smart Mobiles & Gadgets', bg: 'from-blue-600 to-cyan-500' },
  { title: 'Best of Electronics Showcase', tagline: 'No Cost EMI starts from ₹999/month', bg: 'from-indigo-600 to-purple-500' }
];

const SHELF_CONFIGS = [
  { title: '🔥 Mobiles & Accessories Showcase', slug: 'mobiles', tagline: 'Top-selling flagship models & budget kings' },
  { title: '💻 Professional Laptops & Computing', slug: 'laptops', tagline: 'Power setups, MacBooks & expert-rated notebooks' },
  { title: '✨ Lifestyle, Sports & Fashion', slug: 'fashion', tagline: 'Iconic footwear, premium denim & winter outerwear' },
  { title: '📺 Ultrawide TVs & Cinema Screens', slug: 'tvs', tagline: 'Stunning 4K resolution displays with immersive surround' },
  { title: '🛋️ Designer Home & Furnishings', slug: 'home-furniture', tagline: 'Comfort orthopaedic mattresses & solid wood work tables' },
  { title: '❄️ Smart Kitchen & Heavy Appliances', slug: 'appliances', tagline: 'Direct-cooling smart refrigerators & washer dryers' },
  { title: '🧴 Luxury Cosmetics & Personal Care', slug: 'beauty', tagline: 'Hydrating face fluids & expert clinical remedies' },
  { title: '🎧 Premium Audio & Accessories', slug: 'electronics', tagline: 'Noise cancelling overheads & true wireless acoustics' }
];

// Helper to resolve or extract category slug from product objects
const getProductCategorySlug = (product) => {
  if (!product) return '';
  if (product.category && typeof product.category === 'object') {
    return product.category.slug || '';
  }
  const title = (product.title || '').toLowerCase();
  
  if (title.includes('headphone') || title.includes('speaker') || title.includes('soundbar') || title.includes('headset') || title.includes('smartwatch') || title.includes('band')) {
    return 'electronics';
  }
  if (title.includes('iphone') || title.includes('galaxy') || title.includes('pixel') || title.includes('redmi') || title.includes('oneplus 12r') || title.includes('12 pro 5g')) {
    return 'mobiles';
  }
  if (title.includes('macbook') || title.includes('laptop') || title.includes('ideapad') || title.includes('aspire') || title.includes('xps')) {
    return 'laptops';
  }
  if (title.includes('tv') || title.includes('oled') || title.includes('bravia')) {
    return 'tvs';
  }
  if (title.includes('sneaker') || title.includes('shoes') || title.includes('jeans') || title.includes('t-shirt') || title.includes('shirt') || title.includes('trackpants')) {
    return 'fashion';
  }
  if (title.includes('mattress') || title.includes('chair') || title.includes('table') || title.includes('bean bag') || title.includes('sofa') || title.includes('recliner') || title.includes('nightstand')) {
    return 'home-furniture';
  }
  if (title.includes('refrigerator') || title.includes('washing machine') || title.includes('microwave') || title.includes('air conditioner') || title.includes('ac') || title.includes('washer')) {
    return 'appliances';
  }
  if (title.includes('shampoo') || title.includes('moisturizer') || title.includes('toner') || title.includes('foundation') || title.includes('oil') || title.includes('parfum') || title.includes('kajal') || title.includes('face cream')) {
    return 'beauty';
  }
  return '';
};

export default function Home() {
  const navigate = useNavigate();

  // Load maximum possible product capacity to satisfy 50+ total active listings
  const { data: catalogData, isLoading } = useProducts({ limit: 120 });

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const format = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${format(hours)}h : ${format(minutes)}m : ${format(seconds)}s`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const allProducts = catalogData?.products || [];

  // Group items dynamically by shelf configuration
  const mappedShelves = SHELF_CONFIGS.map(shelf => {
    const pList = allProducts.filter(prod => getProductCategorySlug(prod) === shelf.slug);
    return {
      ...shelf,
      products: pList.slice(0, 8) // Show top 8 seeded items in responsive grid
    };
  }).filter(shelf => shelf.products.length > 0);

  // Extract products with active discounts for hot flash area
  const hotDeals = allProducts
    .filter(p => (p.discount || 0) >= 15)
    .slice(0, 4);

  // Calculate loaded catalog size to verify 50+ threshold
  const totalListedProductsCount = mappedShelves.reduce((sum, current) => sum + current.products.length, 0);

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8 max-w-7xl mx-auto pb-16 mt-4 select-none" id="home-page-viewport">
      
      {/* SECTION 1: THREE-COLUMN PROMOTIONAL AD BANNERS (MATCHING SCREENSHOT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="promo-banners-replicated">
        
        {/* Banner 1: Pink Mega Dry Fruits Fest Ad */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#E91E63] to-[#C2185B] text-white p-5 min-h-[190px] flex flex-col justify-between shadow-xs group cursor-pointer hover:shadow-md transition duration-200">
          <div className="z-10">
            {/* Promo Label Badge */}
            <div className="bg-[#FFFF00] text-slate-900 border border-[#FEDC19] font-black text-[9px] tracking-wider px-2 py-0.5 rounded uppercase inline-block mb-3 leading-none shadow-3xs">
              🔥 DRY FRUITS FEST
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight leading-tight max-w-[210px]">
              Dry fruit event
            </h2>
            <p className="text-2.5xl font-black text-yellow-350 tracking-tighter leading-none mt-1">
              Up to 70% Off
            </p>
            <p className="text-[11px] text-white/95 mt-1.5 font-medium leading-none">
              Best deals on walnuts & almonds
            </p>
          </div>

          <div className="flex justify-between items-center z-10 mt-4">
            <span 
              onClick={() => navigate('/products?search=fruit')}
              className="text-[10px] md:text-xs font-bold underline text-yellow-350 hover:text-white flex items-center gap-1"
            >
              Shop Deals now <ArrowRight size={12} />
            </span>
            <span className="text-[9px] text-white/50 bg-black/20 font-bold px-1.5 py-0.5 rounded select-none">AD</span>
          </div>

          {/* Isometric background graphics illustrating nutrition */}
          <div className="absolute right-3 bottom-6 w-32 h-32 opacity-85 select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
            <img 
              src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=260&q=80" 
              alt="Healthy lifestyle nutrition walnuts almonds" 
              className="w-full h-full object-cover rounded-full border-4 border-white/10 shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 2: Cream Health Wellness Days Ad */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5EBE1] to-[#E9DC CE] text-slate-800 p-5 min-h-[190px] flex flex-col justify-between shadow-xs group cursor-pointer hover:shadow-md transition duration-200 border border-slate-200/40">
          <div className="z-10">
            {/* Wellness Badge */}
            <div className="bg-emerald-600 text-white font-extrabold text-[8.5px] tracking-widest px-2.5 py-1 rounded uppercase inline-block mb-3 leading-none shadow-3xs">
              💚 Health & Wellness Days
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 leading-tight">
              Big discounts
            </h2>
            <p className="text-2.5xl font-black text-rose-650 tracking-tighter leading-none mt-1">
              Up to 85% Off
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-semibold leading-none">
              Energy drinks, supplements & more
            </p>
          </div>

          {/* Dots indicating slider beneath middle banner */}
          <div className="flex items-center justify-between z-10 mt-4">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <span 
                  key={idx} 
                  className={`h-1 w-1 rounded-full ${idx === 3 ? 'bg-slate-700 w-2.5' : 'bg-slate-300'}`} 
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-500 bg-slate-200/60 font-bold px-1.5 py-0.5 rounded select-none">AD</span>
          </div>

          {/* Right side illustration container */}
          <div className="absolute right-3 bottom-6 w-32 h-32 opacity-95 select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
            <img 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=260&q=80" 
              alt="Hydration energy wellness supplements" 
              className="w-full h-full object-cover rounded-full border-4 border-slate-100/60 shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 3: Dark Kids Learning Screen Ad */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E1916] to-[#110E0C] text-white p-5 min-h-[190px] flex flex-col justify-between shadow-xs group cursor-pointer hover:shadow-md transition duration-200">
          <div className="z-10">
            {/* Kruddlaank Badge label in screenshot */}
            <div className="bg-[#1D54B4] text-white font-black text-[9px] tracking-wider px-2 py-0.5 rounded uppercase inline-block mb-3 leading-none shadow-3xs">
              🎓 KRUDDLAANK
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight leading-tight max-w-[210px]">
              Interactive play lap
            </h2>
            <p className="text-2.5xl font-black text-amber-400 tracking-tighter leading-none mt-1">
              Up to 60% Off
            </p>
            <p className="text-[11px] text-white/80 mt-1.5 font-medium leading-none">
              A magical portal to children learning
            </p>
          </div>

          <div className="flex justify-between items-center z-10 mt-4">
            <span 
              onClick={() => navigate('/products?search=toy')}
              className="text-[10px] md:text-xs font-bold underline text-amber-400 hover:text-white flex items-center gap-1"
            >
              Explore portal now <ArrowRight size={12} />
            </span>
            <span className="text-[9px] text-white/40 bg-white/10 font-bold px-1.5 py-0.5 rounded select-none">AD</span>
          </div>

          {/* Graphic matching play compute laptop visual */}
          <div className="absolute right-3 bottom-6 w-32 h-32 opacity-90 select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=260&q=80" 
              alt="Interactive child toy tablet learning keyboard" 
              className="w-full h-full object-cover rounded-full border-4 border-white/10 shadow-lg animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>

      {/* SECTION 2: "WIDEST COLLECTION" HIGHLIGHT AREA (MATCHING SCREENSHOT YELLOW BASE) */}
      <div className="bg-[#FFF200] rounded-2xl p-5 md:p-6 shadow-sm border border-yellow-200 overflow-hidden flex flex-col gap-4" id="widest-collection-yellow-shelf">
        
        {/* Banner Section Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-yellow-350/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-amber-700 animate-bounce" />
            <h3 className="text-xl md:text-2.5xl font-black text-slate-900 font-sans tracking-tight leading-none uppercase">
              Widest collection
            </h3>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-850 font-bold">
            <span className="bg-white/80 px-2 py-0.5 rounded text-[10px] tracking-wide animate-pulse uppercase">LIMITED EVENT CATALOGUE</span>
          </div>
        </div>

        {/* 4 Cards laid out exactly like the user's screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Earbuds */}
          <div 
            onClick={() => navigate('/products?search=earbuds')}
            className="bg-white rounded-xl p-3 flex flex-col group cursor-pointer hover:shadow-md transition-all duration-200 border border-yellow-100"
          >
            {/* Elevated light grey box for item alignment */}
            <div className="bg-[#F5F5F5] rounded-xl aspect-square flex items-center justify-center p-3 overflow-hidden shadow-2xs relative">
              <img 
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=325&q=80" 
                alt="boAt, realme, Mivi & more sound earbuds"
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-106 transition duration-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-[#2874F0] text-white font-extrabold text-[8px] px-1 py-0.5 rounded uppercase leading-none">Min 50% Off</span>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] md:text-xs text-slate-500 font-bold truncate">boAt, realme, Mivi & more</p>
              <p className="text-xs md:text-sm font-black text-[#111] mt-0.5">Min 50% Off</p>
            </div>
          </div>

          {/* Card 2: Women Dresses */}
          <div 
            onClick={() => navigate('/products?category=fashion')}
            className="bg-white rounded-xl p-3 flex flex-col group cursor-pointer hover:shadow-md transition-all duration-200 border border-yellow-100"
          >
            <div className="bg-[#F5F5F5] rounded-xl aspect-square flex items-center justify-center p-3 overflow-hidden shadow-2xs relative">
              <img 
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=325&q=80" 
                alt="Maroon beautiful traditional ladies suits"
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-106 transition duration-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-emerald-600 text-white font-extrabold text-[8px] px-1 py-0.5 rounded uppercase leading-none">HOT</span>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] md:text-xs text-slate-500 font-bold truncate">Shop now</p>
              <p className="text-xs md:text-sm font-black text-[#111] mt-0.5">Under ₹599</p>
            </div>
          </div>

          {/* Card 3: Steel bottles */}
          <div 
            onClick={() => navigate('/products?search=bottle')}
            className="bg-white rounded-xl p-3 flex flex-col group cursor-pointer hover:shadow-md transition-all duration-200 border border-yellow-100"
          >
            <div className="bg-[#F5F5F5] rounded-xl aspect-square flex items-center justify-center p-3 overflow-hidden shadow-2xs relative">
              <img 
                src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=325&q=80" 
                alt="Stainless steel water bottles Milton Cello bottles"
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-106 transition duration-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-orange-600 text-white font-extrabold text-[8px] px-1 py-0.5 rounded uppercase leading-none">STEAL DEAL</span>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] md:text-xs text-slate-500 font-bold truncate">Cello, Milton & more</p>
              <p className="text-xs md:text-sm font-black text-[#111] mt-0.5">From ₹99</p>
            </div>
          </div>

          {/* Card 4: Men's sports shoes */}
          <div 
            onClick={() => navigate('/products?search=shoes')}
            className="bg-white rounded-xl p-3 flex flex-col group cursor-pointer hover:shadow-md transition-all duration-200 border border-yellow-100"
          >
            <div className="bg-[#F5F5F5] rounded-xl aspect-square flex items-center justify-center p-3 overflow-hidden shadow-2xs relative">
              <img 
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=325&q=80" 
                alt="White sneakers running sports athletic shoes"
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-106 transition duration-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-rose-600 text-white font-extrabold text-[8px] px-1 py-0.5 rounded uppercase leading-none">50% off</span>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] md:text-xs text-slate-500 font-bold truncate">Men's Sports Shoes</p>
              <p className="text-xs md:text-sm font-black text-[#111] mt-0.5">Min. 50% Off</p>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 3: CORE HORIZON DEALS / FLASH DEALS */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-2xs overflow-hidden flex flex-col">
        {/* Deal block headers */}
        <div className="bg-slate-50 py-4 px-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1">
              ⚡ Limited Hours Super Saver Deals
            </h3>
            <span className="hidden sm:inline-block bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              Clock: {timeLeft}
            </span>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5 uppercase"
          >
            Browse Premium Deals <ChevronRight size={14} />
          </button>
        </div>

        {/* Hot Savors row list */}
        {hotDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-5 bg-slate-50/15">
            {hotDeals.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded m-5">
            No live saver discounts filtered right now. Please seed database or recheck parameters.
          </div>
        )}
      </div>

      {/* VERIFY ACTIVE TOTAL HIGH-CAPACITY CATALOG DISPLAY SHELVES */}
      <div className="flex flex-col gap-8 mt-4" id="catalogue-shelves-container">
        
        {/* Total verified loaded stock count banner */}
        <div className="bg-[#F0F5FF] border-l-4 border-blue-500 p-4 rounded-xl flex items-center justify-between text-blue-900 text-xs md:text-sm shadow-3xs">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-blue-600 animate-spin-slow" />
            <span className="font-semibold text-slate-700">Verified Catalog Connected: Loaded <span className="font-extrabold text-blue-600">{allProducts.length} certified products</span> across category rows.</span>
          </div>
          <span className="hidden md:inline-flex bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full select-none">
            Flipkart Assured ✔
          </span>
        </div>

        {mappedShelves.map((shelf) => (
          <div key={shelf.slug} className="bg-white rounded-2xl border border-slate-150 shadow-2xs overflow-hidden flex flex-col hover:shadow-xs transition duration-200">
            
            {/* Shelf Header block */}
            <div className="py-4 px-6 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex flex-col">
                <h4 className="text-sm md:text-base font-extrabold text-slate-850 tracking-tight">
                  {shelf.title}
                </h4>
                <p className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5">{shelf.tagline}</p>
              </div>
              <button
                onClick={() => navigate(`/products?category=${shelf.slug}`)}
                className="text-[#2874F0] hover:text-blue-700 hover:underline font-bold text-xs flex items-center gap-0.5 transition"
              >
                Browse All <ChevronRight size={14} />
              </button>
            </div>

            {/* Inner row grid of shelf items (up to 8 formatted products) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 p-5 bg-white">
              {shelf.products.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
