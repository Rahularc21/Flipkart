import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Menu, 
  X,
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Plane,
  Heart,
  LogOut,
  ShoppingBag,
  ListFlat,
  Store,
  Bike,
  Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const CATEGORY_TABS = [
  { name: 'Grocery', slug: 'grocery', icon: ShoppingBag },
  { name: 'Mobiles', slug: 'mobiles', icon: Smartphone },
  { name: 'Fashion', slug: 'fashion', icon: Shirt },
  { name: 'Electronics', slug: 'electronics', icon: Tv },
  { name: 'Laptops', slug: 'laptops', icon: Laptop },
  { name: 'Home & Furniture', slug: 'home-furniture', icon: HomeIcon },
  { name: 'Appliances', slug: 'appliances', icon: Store },
  { name: 'Travel', slug: 'travel', icon: Plane },
  { name: 'Beauty', slug: 'beauty', icon: Sparkles },
  { name: 'Two Wheelers', slug: 'two-wheelers', icon: Bike }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const activeCategory = searchParams.get('category');

  const triggerLogout = () => {
    logout();
    navigate('/');
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col shadow-xs" id="custom-app-header">
      
      {/* 1. PRIMARY BLUE TOP BAR */}
      <div className="bg-[#2874F0] text-white py-2.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex flex-col select-none">
              <span className="text-xl font-bold tracking-tight italic leading-none">Flipkart</span>
              <span className="text-[10px] font-bold italic text-[#FFE11B] flex items-center leading-none mt-0.5 self-end">
                Explore <span className="text-white ml-0.5">Plus</span>
                <span className="ml-[1px] text-[11px] font-normal font-sans">✦</span>
              </span>
            </Link>
          </div>

          {/* Search bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative bg-white rounded-sm text-slate-800 shadow-xs overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-100 placeholder-slate-400 font-sans"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 bottom-0 px-4 bg-white text-[#2874F0] flex items-center justify-center cursor-pointer border-l border-slate-100 hover:bg-slate-50"
              aria-label="Search Submit"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Nav Controls */}
          <nav className="hidden md:flex items-center gap-7">
            
            {/* Conditional Login or User Controls */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1 font-bold tracking-wide hover:opacity-95 text-white/95 focus:outline-none cursor-pointer text-sm"
                >
                  <User size={16} />
                  <span>My Account ({user.name})</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 rounded bg-white text-slate-800 shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition font-medium"
                    >
                      <Heart size={14} className="text-rose-500" />
                      <span>My Wishlist</span>
                    </Link>
                    <Link 
                      to="/orders" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition font-medium"
                    >
                      <ShoppingBag size={14} className="text-blue-500" />
                      <span>My Orders</span>
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={triggerLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 transition font-semibold text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-white text-[#2874F0] px-8 py-1.5 font-bold rounded-xs tracking-wide shadow-xs text-xs border border-transparent hover:bg-slate-50 transition active:scale-95 text-center"
              >
                Login
              </Link>
            )}

            <span className="text-white hover:opacity-90 transition font-bold text-sm tracking-wide">
              Become a Seller
            </span>

            {/* Cart Shortcut with badge count */}
            <Link 
              to="/cart"
              className="relative flex items-center gap-2 font-bold hover:opacity-95 text-sm"
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#FB641B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-[#2874F0] h-4 min-w-4 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

          </nav>

          {/* Quick mobile Cart shortcut */}
          <Link 
            to="/cart"
            className="md:hidden relative text-white flex items-center"
            aria-label="Mobile Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FB641B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-[#2874F0] h-4 min-w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* MOBILE SEARCH BAR FOR BETTER ACCESSIBILITY */}
      <div className="md:hidden bg-[#2874F0] px-4 pb-2.5 pt-0.5">
        <form onSubmit={handleSearchSubmit} className="flex bg-white rounded-sm text-slate-800 shadow-xs overflow-hidden">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-1.5 text-xs outline-none placeholder-slate-400 font-sans"
          />
          <button type="submit" className="px-3 bg-white text-[#2874F0] flex items-center justify-center" aria-label="Search Search">
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* 2. WHITE HORIZONTAL CATEGORIES BAR */}
      <div className="bg-white border-b border-slate-100 py-2.5 overflow-x-auto select-none no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 gap-6 md:gap-0 min-w-max md:min-w-0">
          {CATEGORY_TABS.map((tab) => {
            const IconComp = tab.icon;
            const isTabActive = activeCategory === tab.slug;
            return (
              <Link
                key={tab.slug}
                to={`/products?category=${tab.slug}`}
                className={`group flex flex-col items-center gap-1 cursor-pointer transition-colors px-2 ${
                  isTabActive ? 'text-[#2874F0]' : 'text-slate-600 hover:text-[#2874F0]'
                }`}
              >
                <div className={`p-1 rounded-full transition-all duration-300 ${
                  isTabActive ? 'bg-blue-50 scale-105' : 'group-hover:bg-slate-50'
                }`}>
                  <IconComp size={16} className={isTabActive ? 'text-[#2874F0]' : 'text-slate-500 group-hover:text-[#2874F0]'} />
                </div>
                <span className="text-[11px] font-bold tracking-wide font-sans">{tab.name}</span>
                <div className={`h-0.5 bg-[#FB641B] w-0 transition-all duration-300 ${
                  isTabActive ? 'w-full' : 'group-hover:w-1/2'
                }`} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE SLIDE DOWN DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 pt-[80px]" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-4 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="font-bold text-[#2874F0] tracking-wide text-sm">Flipkart Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#2874F0] flex items-center gap-2">
                <Store size={16} /> <span>Home</span>
              </Link>
              {user ? (
                <>
                  <div className="bg-blue-50 p-2.5 rounded-sm flex items-center gap-2">
                    <User size={16} className="text-[#2874F0]" />
                    <span className="text-xs text-[#2874F0]">Jane {user.name}</span>
                  </div>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#2874F0] flex items-center gap-2">
                    <ShoppingBag size={16} /> <span>My Orders</span>
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#2874F0] flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" /> <span>My Wishlist</span>
                  </Link>
                  <button 
                    onClick={triggerLogout}
                    className="py-2 text-rose-600 hover:text-rose-700 text-left cursor-pointer flex items-center gap-2"
                  >
                    <LogOut size={16} /> <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 text-center bg-[#2874F0] text-white rounded font-bold">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM ICON BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] py-2">
        <div className="flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#2874F0] active:scale-95">
            <Store size={18} />
            <span className="text-[9px] font-bold font-sans">Home</span>
          </Link>
          <button onClick={() => navigate('/products')} className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#2874F0] active:scale-95 cursor-pointer">
            <Search size={18} />
            <span className="text-[9px] font-bold font-sans">Explore</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#2874F0] active:scale-95 relative">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#FB641B] text-white text-[8px] font-bold h-3 min-w-3 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[9px] font-bold font-sans">Cart</span>
          </Link>
          <Link to={user ? "/orders" : "/login"} className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#2874F0] active:scale-95">
            <User size={18} />
            <span className="text-[9px] font-bold font-sans">{user ? 'Orders' : 'Account'}</span>
          </Link>
        </div>
      </div>

    </header>
  );
}
