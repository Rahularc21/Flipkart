import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  X,
  Menu,
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
  Store,
  Bike,
  Smile,
  Apple,
  Shield,
  Dumbbell,
  Book,
  Armchair,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const CATEGORY_TABS = [
  { name: 'For You', slug: 'for-you', icon: ShoppingBag, path: '/' },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, path: '/products?category=fashion' },
  { name: 'Mobiles', slug: 'mobiles', icon: Smartphone, path: '/products?category=mobiles' },
  { name: 'Beauty', slug: 'beauty', icon: Sparkles, path: '/products?category=beauty' },
  { name: 'Electronics', slug: 'electronics', icon: Tv, path: '/products?category=electronics' },
  { name: 'Home', slug: 'home-furniture', icon: HomeIcon, path: '/products?category=home-furniture' },
  { name: 'Appliances', slug: 'appliances', icon: Store, path: '/products?category=appliances' },
  { name: 'Toys, ba...', slug: 'toys', icon: Smile, path: '/products?category=toys' },
  { name: 'Food & H...', slug: 'food', icon: Apple, path: '/products?category=food' },
  { name: 'Auto Acc...', slug: 'auto', icon: Shield, path: '/products?category=auto' },
  { name: '2 Wheele...', slug: 'two-wheelers', icon: Bike, path: '/products?category=two-wheelers' },
  { name: 'Sports & ...', slug: 'sports', icon: Dumbbell, path: '/products?category=sports' },
  { name: 'Books & ...', slug: 'books', icon: Book, path: '/products?category=books' },
  { name: 'Furniture', slug: 'furniture', icon: Armchair, path: '/products?category=furniture' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const activeCategory = searchParams.get('category');
  const isHomePage = location.pathname === '/';

  const triggerLogout = () => {
    logout();
    navigate('/');
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="w-full flex flex-col bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs" id="custom-app-header">
      
      {/* ROW 1: BRAND SWITCHER & LOCATION SELECTOR */}
      <div className="bg-slate-50/70 border-b border-slate-100 py-2 px-4 md:px-8 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Switchers */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-700 focus:outline-none cursor-pointer p-1 rounded hover:bg-slate-200 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Flipkart Pill Active */}
            <Link 
              to="/" 
              className="flex items-center gap-1.5 bg-[#FEDC19] text-[#1D54B4] font-extrabold text-[11px] md:text-xs px-4 py-1.5 rounded-full border border-[#D5B80D] shadow-2xs leading-none transition duration-150 hover:bg-[#FFE330]"
            >
              <ShoppingBag size={13} className="fill-[#1D54B4]" />
              Flipkart
            </Link>

            {/* Travel Pill Inactive */}
            <button 
              onClick={() => navigate('/products?category=travel')}
              className="flex items-center gap-1.5 bg-white text-slate-600 font-bold text-[11px] md:text-xs px-4 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 shadow-2xs leading-none transition-all duration-150"
            >
              <Plane size={13} className="text-rose-500 fill-rose-100" />
              Travel
            </button>
          </div>

          {/* Location Picker */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <MapPin size={13} className="text-slate-400" />
            <span className="text-[11px] md:text-xs text-slate-500 font-medium">Location not set</span>
            <button 
              onClick={() => alert("Simulating geo-location targeting: Your delivery location has been calibrated to Kolkata, WB!")}
              className="text-[#2874F0] text-[11px] md:text-xs font-bold hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
            >
              Select delivery location <span className="font-mono text-[9px]">&gt;</span>
            </button>
          </div>

        </div>
      </div>

      {/* ROW 2: SEARCH & ACTION LINKS */}
      <div className="bg-white py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 md:gap-8">
          
          {/* Responsive Brand Logo label for SEO/Visual alignment */}
          <Link to="/" className="flex flex-col select-none border-r border-slate-100 pr-5 hidden lg:flex">
            <span className="text-xl font-extrabold tracking-tight italic text-[#2874F0] leading-none">flipkart</span>
            <span className="text-[9px] font-bold italic text-[#2874F0] flex items-center leading-none mt-0.5 self-end">
              Explore <span className="text-amber-500 ml-0.5">Plus</span>
              <span className="ml-[1px] text-[10px] font-normal font-sans text-amber-500">✦</span>
            </span>
          </Link>

          {/* Primary Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl relative bg-[#F0F5FF]/60 hover:bg-[#F0F5FF] focus-within:bg-[#F0F5FF] focus-within:ring-1 focus-within:ring-blue-400 transition-all rounded-md text-slate-800 overflow-hidden border border-slate-250 flex items-center h-10"
          >
            <div className="pl-3 text-slate-400 flex items-center justify-center">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-2.5 pr-12 py-2 text-xs md:text-sm outline-none placeholder-slate-500 font-sans font-medium"
            />
          </form>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 min-w-max">
            
            {/* User Profile dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#2874F0] focus:outline-none cursor-pointer text-xs md:text-sm transition py-2"
                >
                  <User size={16} className="text-slate-500" />
                  <span>{user.name}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div 
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                    className="absolute right-0 mt-1 w-48 rounded bg-white text-slate-800 shadow-xl border border-slate-100 py-1.5 z-50 text-xs font-semibold"
                  >
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                    >
                      <Heart size={14} className="text-rose-500" />
                      <span>My Wishlist</span>
                    </Link>
                    <Link 
                      to="/orders" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                    >
                      <ShoppingBag size={14} className="text-blue-500" />
                      <span>My Orders</span>
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={triggerLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 transition font-bold text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => navigate('/login')}
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  className="flex items-center gap-1 font-bold text-slate-750 hover:text-[#2874F0] py-2 transition text-xs md:text-sm cursor-pointer"
                >
                  <User size={16} className="text-slate-500" />
                  <span>Login</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div 
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                    className="absolute right-0 mt-1 w-44 rounded bg-white text-slate-800 shadow-xl border border-slate-100 py-2.5 px-3 z-50 text-center"
                  >
                    <p className="text-[10px] text-slate-400 font-semibold mb-2">New customer?</p>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded text-xs transition"
                    >
                      Sign Up
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <Link 
                      to="/login"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="text-xs text-[#2874F0] font-bold hover:underline"
                    >
                      Log In Securely
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* More Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                onMouseEnter={() => setIsMoreDropdownOpen(true)}
                className="flex items-center gap-1 font-bold text-slate-750 hover:text-[#2874F0] transition text-xs md:text-sm cursor-pointer py-2"
              >
                <span>More</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreDropdownOpen && (
                <div 
                  onMouseLeave={() => setIsMoreDropdownOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 rounded bg-white text-slate-800 shadow-xl border border-slate-100 py-1.5 z-50 text-xs font-semibold"
                >
                  <button 
                    onClick={() => { setIsMoreDropdownOpen(false); alert("Notification Center is updated!"); }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <span>Notification Preferences</span>
                  </button>
                  <button 
                    onClick={() => { setIsMoreDropdownOpen(false); alert("Customer support is online 24/7."); }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <span>24x7 Customer Care</span>
                  </button>
                  <Link 
                    to="/products" 
                    onClick={() => setIsMoreDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-slate-50"
                  >
                    Advertise Catalog
                  </Link>
                  <button 
                    onClick={() => { setIsMoreDropdownOpen(false); alert("Flipkart Plus loyalty points calibrated!"); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-600 font-bold"
                  >
                    Flipkart Plus Zone
                  </button>
                </div>
              )}
            </div>

            {/* Cart Link with count */}
            <Link 
              to="/cart"
              className="relative flex items-center gap-2 font-bold text-slate-750 hover:text-[#2874F0] transition text-xs md:text-sm group"
            >
              <div className="relative">
                <ShoppingCart size={19} className="text-slate-600 group-hover:text-[#2874F0] transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FB641B] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white h-4 min-w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

          </div>

          {/* Simple Mobile Cart link */}
          <Link 
            to="/cart"
            className="md:hidden relative text-slate-600 flex items-center"
            aria-label="Mobile Cart"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FB641B] text-white text-[9px] font-extrabold px-1.5 h-3.5 min-w-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* CATEGORIES BAR: REPLICATED EXACTLY */}
      <div className="bg-white border-t border-slate-100 py-3 overflow-x-auto select-none no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 gap-6 md:gap-0 min-w-max md:min-w-0">
          {CATEGORY_TABS.map((tab) => {
            const IconComp = tab.icon;
            
            // Highlight 'For You' if no category is picked on HomePage, otherwise match activeCategory
            const isTabActive = activeCategory === tab.slug || (tab.slug === 'for-you' && !activeCategory && isHomePage);
            
            return (
              <Link
                key={tab.slug}
                to={tab.path}
                className={`group flex flex-col items-center gap-1 cursor-pointer transition-colors px-2 relative ${
                  isTabActive ? 'text-blue-600 font-extrabold scale-102' : 'text-slate-600 font-medium hover:text-blue-600'
                }`}
              >
                {/* Yellow outline container for active/hover effect */}
                <div className={`p-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isTabActive 
                    ? 'bg-amber-50 outline-2 outline-dashed outline-amber-400 scale-105' 
                    : 'group-hover:bg-slate-50'
                }`}>
                  <IconComp 
                    size={18} 
                    className={isTabActive ? 'text-[#2874F0]' : 'text-slate-500 group-hover:text-blue-650'} 
                  />
                </div>
                
                <span className="text-[11px] md:text-xs font-sans tracking-tight">{tab.name}</span>
                
                {/* Underline bar matching screenshot blue line */}
                {isTabActive && (
                  <div className="absolute -bottom-3 left-1/4 right-1/4 h-[3px] bg-[#2874F0] rounded-t-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/65 pt-[80px]" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-4 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-150">
              <span className="font-extrabold text-[#2874F0] tracking-wider text-md">flipkart</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1 text-slate-500"><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 hover:text-[#2874F0] flex items-center gap-2 border-b border-slate-50">
                <Store size={16} /> <span>Home Catalog</span>
              </Link>
              {user ? (
                <>
                  <div className="bg-blue-50 p-2.5 rounded flex items-center gap-2">
                    <User size={16} className="text-[#2874F0]" />
                    <span className="text-xs text-[#2874F0] font-bold">Signed in as {user.name}</span>
                  </div>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#2874F0] flex items-center gap-2">
                    <ShoppingBag size={16} /> <span>My Orders</span>
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#2874F0] flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" /> <span>My Wishlist</span>
                  </Link>
                  <button 
                    onClick={triggerLogout}
                    className="py-2 text-rose-600 hover:text-rose-700 text-left cursor-pointer flex items-center gap-2 border-t border-slate-50 mt-4 font-bold"
                  >
                    <LogOut size={16} /> <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center bg-[#2874F0] text-white rounded font-bold tracking-wide">
                  Login & SignUp
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
