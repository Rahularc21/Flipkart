import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import Loader from '../components/Loader.jsx';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const navigate = useNavigate();
  const { items: wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (productId) => {
    try {
      const res = await toggleWishlist(productId);
      if (res.success) {
        toast.success('Product successfully deleted from collection list.');
      }
    } catch (err) {
      toast.error('An error occurred. Check session.');
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      const res = await addToCart(product._id, 1);
      if (res.success) {
        toast.success(`'${product.title}' successfully moved to your shopping Cart.`);
        await toggleWishlist(product._id);
      } else {
        toast.error(res.message || 'Please log in to purchase products.');
        navigate('/login');
      }
    } catch (err) {
      toast.error('Session expiration check failed.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center bg-white rounded border border-slate-100 shadow-3xs my-8 shrink-0 select-none animate-fade-in" id="empty-wishlist-view">
        <div className="bg-rose-50/70 p-6 rounded-full text-rose-500 mb-4 animate-pulse">
          <Heart size={42} className="fill-rose-500 text-rose-500" />
        </div>
        <h2 className="text-base md:text-lg font-bold text-dark-text font-sans">Your Wishlist is Empty!</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium max-w-sm leading-normal font-sans">
          You haven't stowed away any items into your collection yet. Spot exciting deals across Flipkart now!
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none animate-fade-in" id="wishlist-workspace">
      
      <h1 className="text-base md:text-lg font-bold text-dark-text mb-6">My Saved Collections Wishlist ({wishlistItems.length} Products)</h1>

      <div className="bg-white border rounded shadow-3xs divide-y divide-slate-100">
        
        {wishlistItems.map((prod) => {
          if (!prod) return null;
          const imageSrc = prod.images?.[0] || `https://picsum.photos/seed/${prod._id}/100/100`;

          return (
            <div key={prod._id} className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              
              <div className="flex items-center justify-center p-2 border rounded bg-white aspect-square h-20 w-20 sm:mx-0 mx-auto overflow-hidden">
                <img src={imageSrc} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
              </div>

              <div className="sm:col-span-2 flex flex-col text-center sm:text-left">
                <span className="text-xs text-muted-text font-bold uppercase tracking-wider">{prod.brand}</span>
                <Link 
                  to={`/products/${prod._id}`}
                  className="mt-0.5 text-xs md:text-sm font-semibold text-slate-800 hover:text-primary transition line-clamp-2"
                >
                  {prod.title}
                </Link>

                <div className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 font-sans">
                  <span className="bg-[#388E3C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                    {prod.ratings?.average || 4.1}★
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">Assured Verified Product</span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-center sm:justify-start flex-wrap gap-2">
                  <span className="text-sm font-bold text-dark-text">{formatPrice(prod.price)}</span>
                  <span className="text-xs text-slate-400 line-through font-semibold">{formatPrice(prod.originalPrice)}</span>
                  <span className="text-xs font-bold text-success-green">{prod.discount}% Off</span>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-center gap-3">
                <button
                  onClick={() => handleMoveToCart(prod)}
                  className="w-full sm:w-fit py-2 px-5 bg-[#2874F0] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-xs transition select-none active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={13} /> Move to Cart
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(prod._id)}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase flex items-center gap-1 py-1 px-2 cursor-pointer transition select-none"
                >
                  <Trash2 size={13} /> Delete item
                </button>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}
