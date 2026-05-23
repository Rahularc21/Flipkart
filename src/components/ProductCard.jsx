import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await toggleWishlist(product._id);
      if (res.success) {
        if (res.isAdded) {
          toast.success(`'${product.title}' saved to Wishlist.`);
        } else {
          toast.success(`Removed from Wishlist.`);
        }
      } else {
        toast.error(res.message || 'Please log in to update your wishlist.');
        navigate('/login');
      }
    } catch (err) {
      toast.error('An error occurred. Check credentials.');
    }
  };

  const ratingsVal = product.ratings || { average: 4.1, count: 120 };
  const imageSrc = product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/400`;

  return (
    <div className="group relative flex flex-col h-full bg-white border border-slate-100 hover:shadow-lg transition-all duration-300 rounded-md overflow-hidden animate-fade-in" id={`product-card-${product._id}`}>
      <Link to={`/products/${product._id}`} className="flex flex-col h-full p-3 select-none">
        
        <div className="relative aspect-square w-full bg-white flex items-center justify-center p-2 mb-3 overflow-hidden">
          <img
            src={imageSrc}
            alt={product.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {ratingsVal.average >= 4.3 && (
            <span className="absolute bottom-1 left-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs select-none uppercase tracking-wide">
              Assured
            </span>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <span className="text-xs text-muted-text font-semibold uppercase tracking-wider mb-0.5">{product.brand}</span>
          <h4 className="text-xs md:text-sm font-medium text-dark-text leading-tight line-clamp-2 min-h-[36px] group-hover:text-primary transition-colors">
            {product.title}
          </h4>

          <div className="flex items-center gap-1.5 mt-1.5 mb-2">
            <span className="inline-flex items-center gap-0.5 bg-success-green text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded px-2">
              {ratingsVal.average} <Star size={10} className="fill-white" />
            </span>
            <span className="text-[11px] text-[#878787] font-medium">
              ({Number(ratingsVal.count).toLocaleString()})
            </span>
          </div>

          <div className="mt-auto pt-1">
            <div className="flex items-baseline flex-wrap gap-1.5">
              <span className="text-sm md:text-base font-bold text-dark-text">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted-text line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-xs font-bold text-success-green">
                {product.discount}% off
              </span>
            </div>
            
            <p className="text-[11px] text-[#388E3C] font-semibold mt-1">
              FREE Delivery
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label="Wishlist Toggle"
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/95 text-slate-400 hover:text-rose-500 hover:scale-105 shadow-xs border border-slate-100 transition-all duration-250 cursor-pointer"
      >
        <Heart
          size={16}
          className={`${isSaved ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-400 hover:text-rose-500'}`}
        />
      </button>
    </div>
  );
}
