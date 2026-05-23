import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { SlidersHorizontal, ChevronRight, Star, X, ArrowLeft, Heart } from 'lucide-react';

const SORT_PILLS = [
  { label: 'Popularity', val: 'popularity' },
  { label: 'Price -- Low to High', val: 'price_asc' },
  { label: 'Price -- High to Low', val: 'price_desc' },
  { label: 'Customer Rating', val: 'rating' },
  { label: 'Newest First', val: 'newest' }
];

const DISCOUNT_SLABS = [
  { label: '30% or More', val: '30' },
  { label: '20% or More', val: '20' },
  { label: '10% or More', val: '10' }
];

export default function ProductList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Drawers
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Parse URL queries
  const activeSearch = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeBrands = searchParams.get('brand') || '';
  const activeRating = searchParams.get('rating') || '';
  const activeDiscount = searchParams.get('discount') || '';
  const activeSort = searchParams.get('sort') || 'popularity';
  const activePage = Number(searchParams.get('page')) || 1;

  // Fetch Categories list
  const { data: categories = [] } = useCategories();

  // Fetch filtered products list
  const { data: productData, isLoading } = useProducts({
    search: activeSearch,
    category: activeCategory,
    minPrice: activeMinPrice,
    maxPrice: activeMaxPrice,
    brand: activeBrands,
    rating: activeRating,
    discount: activeDiscount,
    sort: activeSort,
    page: activePage,
    limit: 12
  });

  // Unique Brand items generated dynamically for result counts
  const availableBrandsList = [
    'Apple', 'Samsung', 'Sony', 'Bose', 'Noise', 'boAt', 'JBL', 'Sennheiser',
    'OnePlus', 'Google', 'Xiaomi', 'Realme', 'Dell', 'HP', 'Asus', 'Lenovo',
    'Acer', 'LG', 'TCL', 'Nike', 'Adidas', 'Puma', 'Levis', 'Zara', 'Roadster',
    'Sleepwell', 'Nilkamal', 'Urban Ladder', 'IKEA', 'Durian', 'Whirlpool',
    'Godrej', 'Daikin', 'IFB', 'Loreal', 'Nivea', 'The Body Shop', 'Maybelline',
    'Mamaearth', 'Clinique'
  ];

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Always reset page index back to 1 when changing active filters
    if (key !== 'page') {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const toggleBrandFilter = (brandName) => {
    let currentBrands = activeBrands ? activeBrands.split(',') : [];
    if (currentBrands.includes(brandName)) {
      currentBrands = currentBrands.filter(b => b !== brandName);
    } else {
      currentBrands.push(brandName);
    }
    updateFilters('brand', currentBrands.join(','));
  };

  const clearAllFilters = () => {
    setSearchParams(activeSearch ? { search: activeSearch } : {});
    setIsMobileFilterOpen(false);
  };

  const productsList = productData?.products || [];
  const totalCount = productData?.totalCount || 0;
  const totalPages = productData?.totalPages || 1;

  // Breadcrumbs title
  const categoryTitle = categories.find(c => c.slug === activeCategory)?.name || activeCategory;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-16" id="products-catalog-screen">
      
      {/* 1. BREADCRUMBS ROW */}
      <div className="text-xs text-muted-text flex items-center gap-1.5 mb-4 font-sans uppercase tracking-wider select-none">
        <button onClick={() => navigate('/')} className="hover:underline hover:text-primary">Home</button>
        {categoryTitle && (
          <>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-700">{categoryTitle}</span>
          </>
        )}
        {activeSearch && (
          <>
            <ChevronRight size={12} />
            <span className="font-semibold text-slate-700">Search results for "{activeSearch}"</span>
          </>
        )}
      </div>

      {/* QUICK MOBILE FILTER STATUS ROW */}
      <div className="md:hidden flex items-center justify-between bg-white border border-slate-200 rounded p-3.5 mb-4 select-none">
        <div className="text-xs text-slate-600">
          Showing <span className="font-bold">{totalCount}</span> items
        </div>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-1 bg-[#2874F0] text-white font-bold text-xs px-3.5 py-1.5 rounded-sm shadow-xs cursor-pointer active:scale-95 transition"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* A. LEFT SIDEBAR FILTERS (Flex column) */}
        <aside className="hidden md:flex flex-col bg-white border border-slate-100 rounded shadow-2xs divide-y divide-slate-100">
          
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 tracking-tight text-sm">Filters</h3>
            <button 
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer uppercase tracking-wider"
            >
              Clear All
            </button>
          </div>

          {/* Categorical filters */}
          <div className="p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-sans select-none">
                <input
                  type="radio"
                  name="cat-fit"
                  checked={!activeCategory}
                  onChange={() => updateFilters('category', '')}
                  className="rounded-full text-primary focus:ring-sky-200 h-3.5 w-3.5"
                />
                <span className={!activeCategory ? 'font-bold text-primary' : ''}>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-sans select-none">
                  <input
                    type="radio"
                    name="cat-fit"
                    checked={activeCategory === cat.slug}
                    onChange={() => updateFilters('category', cat.slug)}
                    className="rounded-full text-primary focus:ring-sky-200 h-3.5 w-3.5"
                  />
                  <span className={activeCategory === cat.slug ? 'font-bold text-primary' : ''}>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing parameters range sliders */}
          <div className="p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Range</h4>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="Min Price"
                value={activeMinPrice}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
                className="w-full text-xs font-mono p-1.5 border border-slate-200 rounded text-slate-800 outline-none focus:border-primary"
              />
              <span className="text-xs text-slate-400 font-sans">to</span>
              <input
                type="number"
                placeholder="Max Price"
                value={activeMaxPrice}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                className="w-full text-xs font-mono p-1.5 border border-slate-200 rounded text-slate-800 outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Dynamic Brands checklist */}
          <div className="p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Name</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pt-1 pl-1">
              {availableBrandsList.map((brandName) => {
                const isSelected = activeBrands.split(',').includes(brandName);
                return (
                  <label key={brandName} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer font-sans select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrandFilter(brandName)}
                      className="rounded border-slate-300 text-primary focus:ring-blue-100 h-3.5 w-3.5"
                    />
                    <span className={isSelected ? 'font-bold text-slate-900' : ''}>{brandName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Customer Rating filters */}
          <div className="p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ratings</h4>
            <div className="flex flex-col gap-2 pt-1">
              {[4, 3, 2].map((stars) => {
                const isSelected = Number(activeRating) === stars;
                return (
                  <label key={stars} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer font-sans select-none">
                    <input
                      type="radio"
                      name="rating-fit"
                      checked={isSelected}
                      onChange={() => updateFilters('rating', isSelected ? '' : stars)}
                      className="rounded-full text-primary focus:ring-blue-100 h-3.5 w-3.5"
                    />
                    <span className="flex items-center gap-1 font-medium">
                      {stars}★ & above
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Discount Slabs */}
          <div className="p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount %</h4>
            <div className="flex flex-col gap-2 pt-1">
              {DISCOUNT_SLABS.map((slab) => {
                const isSelected = activeDiscount === slab.val;
                return (
                  <label key={slab.val} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer font-sans select-none">
                    <input
                      type="radio"
                      name="discount-fit"
                      checked={isSelected}
                      onChange={() => updateFilters('discount', isSelected ? '' : slab.val)}
                      className="rounded-full text-primary focus:ring-blue-100 h-3.5 w-3.5"
                    />
                    <span className="font-medium">{slab.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </aside>

        {/* B. CENTRAL PRODUCTS DISPLAY (Col span 3) */}
        <main className="md:col-span-3 flex flex-col gap-4">
          
          {/* SORTING PILLS HEADER LINE */}
          <div className="bg-white border border-slate-100 rounded shadow-3xs p-4 flex flex-col select-none">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-dark-text tracking-wide uppercase font-sans">
                {activeSearch ? `Search results for "${activeSearch}"` : categoryTitle ? `${categoryTitle} Catalogue` : 'All Products Catalog'}
              </h2>
              <span className="text-[11px] md:text-sm text-muted-text font-medium font-sans">
                Showing {productsList.length} of {totalCount} items
              </span>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-6 mt-3 text-xs md:text-sm overflow-x-auto no-scrollbar min-w-max pb-1">
              <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Sort By:</span>
              <div className="flex items-center gap-4">
                {SORT_PILLS.map((pill) => {
                  const isPillActive = activeSort === pill.val;
                  return (
                    <button
                      key={pill.val}
                      onClick={() => updateFilters('sort', pill.val)}
                      className={`font-semibold pb-1.5 px-1 border-b-2 text-xs md:text-sm tracking-wide cursor-pointer select-none transition-all duration-200 ${
                        isPillActive ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-600 hover:text-primary'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN GRID CELLS LAYOUT */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-white border border-slate-100 rounded">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
            </div>
          ) : productsList.length === 0 ? (
            <div className="bg-white text-center p-12 border border-slate-100 rounded flex flex-col items-center">
              <div className="text-4xl text-slate-300">🔍</div>
              <h3 className="mt-4 text-base font-bold text-slate-700">No matches found.</h3>
              <p className="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
                Remove or adjust filters or change search queries to discover stunning deals inside Flipkart!
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 border border-primary text-primary font-bold text-xs rounded-xs px-5 py-2 hover:bg-blue-50 transition active:scale-95 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsList.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* PAGINATION PANEL FOOTER */}
              {totalPages > 1 && (
                <div className="bg-white p-4 border border-slate-100 rounded flex items-center justify-between select-none mt-4 font-sans">
                  <button
                    disabled={activePage <= 1}
                    onClick={() => updateFilters('page', activePage - 1)}
                    className="border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-sm cursor-pointer hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex items-center gap-1 text-slate-600 text-xs md:text-sm font-semibold select-none">
                    Page <span className="font-bold text-slate-900">{activePage}</span> of {totalPages}
                  </div>

                  <button
                    disabled={activePage >= totalPages}
                    onClick={() => updateFilters('page', activePage + 1)}
                    className="border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-sm cursor-pointer hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* MOBILE FULL-SCREEN RESPONSIVE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex justify-end" onClick={() => setIsMobileFilterOpen(false)}>
          <div 
            className="w-4/5 max-w-xs bg-white h-full flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="font-bold text-sm text-slate-800">Catalogue Filters</span>
              </div>
              <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters"><X size={18} /></button>
            </div>

            {/* Scrollable Content inside Drawer */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              
              {/* Category radio selectors */}
              <div className="p-4 gap-2 flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
                <div className="flex flex-col gap-2.5 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="m-cat-fit"
                      checked={!activeCategory}
                      onChange={() => { updateFilters('category', ''); setIsMobileFilterOpen(false); }}
                      className="rounded-full text-primary focus:ring-sky-200 h-3.5 w-3.5"
                    />
                    <span className={!activeCategory ? 'font-bold text-primary' : ''}>All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="m-cat-fit"
                        checked={activeCategory === cat.slug}
                        onChange={() => { updateFilters('category', cat.slug); setIsMobileFilterOpen(false); }}
                        className="rounded-full text-primary focus:ring-sky-200 h-3.5 w-3.5"
                      />
                      <span className={activeCategory === cat.slug ? 'font-bold text-primary' : ''}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price inputs */}
              <div className="p-4 gap-2 flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Options</span>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    className="w-full text-xs font-mono p-1.5 border border-slate-200 rounded text-slate-800 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    className="w-full text-xs font-mono p-1.5 border border-slate-200 rounded text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Brands checklist */}
              <div className="p-4 gap-2 flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brands list</span>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pl-1">
                  {availableBrandsList.map((bName) => {
                    const isSelected = activeBrands.split(',').includes(bName);
                    return (
                      <label key={bName} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none font-sans">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBrandFilter(bName)}
                          className="rounded text-primary border-slate-300 h-3.5 w-3.5"
                        />
                        <span className={isSelected ? 'font-bold' : ''}>{bName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rating stars */}
              <div className="p-4 gap-2 flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ratings</span>
                <div className="flex flex-col gap-2.5 pt-1">
                  {[4, 3, 2].map((st) => (
                    <label key={st} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="m-rat-fit"
                        checked={Number(activeRating) === st}
                        onChange={() => { updateFilters('rating', Number(activeRating) === st ? '' : st); setIsMobileFilterOpen(false); }}
                        className="rounded-full text-primary h-3.5 w-3.5"
                      />
                      <span>{st}★ & above</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="p-4 border-t bg-slate-50 flex items-center justify-between select-none">
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-slate-500 hover:opacity-80 py-2.5 px-3 uppercase tracking-wider"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="bg-primary text-white font-bold text-xs rounded shadow-xs py-2.5 px-6 uppercase tracking-wider cursor-pointer active:scale-95"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
