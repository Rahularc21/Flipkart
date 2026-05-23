import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatPrice } from '../utils/helpers.js';
import StarRating from '../components/StarRating.jsx';
import { ShoppingCart, Zap, Heart, ShieldCheck, MapPin, Truck, Award, Sparkles, MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Component States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  
  // Pincode check
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Add review form
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetailAndSimilar = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.success) {
          setProduct(res.data);
          
          // Fetch similar products in same category (limit to 4)
          if (res.data.category) {
            const categoryId = res.data.category._id || res.data.category;
            const similarRes = await api.get('/products', {
              params: { category: categoryId, limit: 5 }
            });
            if (similarRes.success) {
              const items = similarRes.data.products || [];
              setSimilarProducts(items.filter(p => p._id !== res.data._id).slice(0, 4));
            }
          }
        } else {
          toast.error(res.message || 'Product not found.');
        }
      } catch (err) {
        console.error('Failed fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailAndSimilar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white/50" id="detail-loader">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
        <p className="mt-4 text-xs font-bold text-slate-500 animate-pulse uppercase tracking-widest">Hydrating Catalog...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white border rounded shadow-2xs max-w-lg mx-auto my-12" id="detail-empty">
        <span className="text-3xl text-slate-300">⚠️</span>
        <h3 className="mt-4 text-sm font-bold text-slate-700">Catalogue Entry Missing</h3>
        <p className="mt-1 text-xs text-slate-400">This item might have been unlisted or moved.</p>
        <button onClick={() => navigate('/')} className="mt-6 bg-[#2874F0] text-white font-bold text-xs px-6 py-2.5 rounded-sm shadow-xs hover:bg-blue-600 transition">
          Return Home
        </button>
      </div>
    );
  }

  // Handle Cart Insertions
  const handleCartAction = async (directCheckout = false) => {
    try {
      const res = await addToCart(product._id, 1);
      if (res.success) {
        toast.success(`'${product.title}' successfully added to Cart.`);
        if (directCheckout) {
          navigate('/checkout');
        } else {
          navigate('/cart');
        }
      } else {
        toast.error(res.message || 'Please log in to purchase products.');
        navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      }
    } catch (err) {
      toast.error('An error occurred. Check credentials.');
    }
  };

  // Wishlist actions
  const handleWishlistToggle = async () => {
    try {
      const res = await toggleWishlist(product._id);
      if (res.success) {
        if (res.isAdded) {
          toast.success('Successfully saved to Wishlist.');
        } else {
          toast.success('Removed from Wishlist.');
        }
      } else {
        toast.error(res.message || 'Please log in to update your wishlist.');
        navigate('/login');
      }
    } catch (err) {
      toast.error('Failed toggling wishlist. Check session.');
    }
  };

  // Pincode delivery estimates
  const checkPincodeDelivery = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error('Kindly provide a valid 6-digit postal code.');
      setPincodeStatus(null);
      return;
    }

    const estimatedDays = 3 + (Number(pincode.substring(0, 2)) % 4);
    const dateEstimate = new Date();
    dateEstimate.setDate(dateEstimate.getDate() + estimatedDays);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };

    setPincodeStatus({
      success: true,
      deliveryDate: dateEstimate.toLocaleDateString('en-IN', options),
      isFree: true
    });
  };

  // Client-submitted review handler
  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!userReviewText.trim()) {
      toast.error('Please write a brief comment describing your experience.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: userRating,
        reviewText: userReviewText
      });

      if (res.success) {
        toast.success('Your review was recorded successfully!');
        setUserReviewText('');
        // Refresh product detail local state in real-time
        setProduct(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ratings: { average: res.data.average, count: res.data.count },
            reviews: res.data.reviews
          };
        });
      } else {
        toast.error(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      toast.error(err.message || 'Login to share reviews and ratings.');
      navigate('/login');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Core properties
  const isSaved = isInWishlist(product._id);
  const mainImage = product.images?.[activeImageIdx] || `https://picsum.photos/seed/${product._id}/400/400`;
  const reviewsList = product.reviews || [];
  const specsList = product.specifications || [];
  const highlightsList = product.highlights || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20 select-none" id="product-detail-screen">
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* A. LEFT STICKY PANEL: IMAGES + BUTTON ACTIONS (Col span 2) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-slate-100 rounded p-4 relative flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            <img
              src={mainImage}
              alt={product.title}
              className="max-h-[360px] max-w-full object-contain transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            
            {/* Wishlist Floating Pill button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-50 border hover:scale-105 transition shadow-2xs hover:text-rose-500 cursor-pointer text-slate-400"
            >
              <Heart size={18} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 justify-center py-1 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-14 w-14 p-1 rounded-sm border bg-white flex items-center justify-center cursor-pointer transition ${
                    idx === activeImageIdx ? 'border-primary ring-1 ring-sky-100' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* ACTION CONSOLES: STICKY DESKTOP BUTTONS */}
          <div className="grid grid-cols-2 gap-3.5 mt-2">
            
            <button
              onClick={() => handleCartAction(false)}
              className="py-3 px-4 font-bold rounded-sm border border-[#2874F0] text-[#2874F0] bg-white hover:bg-blue-50/50 transition flex items-center justify-center gap-2 select-none active:translate-y-[1px] cursor-pointer text-xs md:text-sm uppercase tracking-wider"
            >
              <ShoppingCart size={18} /> Add To Cart
            </button>

            <button
              onClick={() => handleCartAction(true)}
              className="py-3 px-4 font-bold rounded-sm bg-[#FB641B] hover:bg-orange-600 text-white transition flex items-center justify-center gap-2 select-none active:translate-y-[1px] cursor-pointer shadow-xs text-xs md:text-sm uppercase tracking-wider"
            >
              <Zap size={18} className="fill-white" /> Buy Now
            </button>

          </div>
        </div>

        {/* B. RIGHT PANEL: DETAILS + ACCORDIONS + REVIEWS (Col span 3) */}
        <div className="md:col-span-3 flex flex-col gap-6">
          
          {/* Header titles */}
          <div className="bg-white border border-slate-100 rounded shadow-3xs p-5">
            <span className="text-xs text-[#878787] font-bold uppercase tracking-widest">{product.brand} Catalogue</span>
            <h1 className="mt-1 text-base md:text-xl font-medium text-dark-text leading-tight">{product.title}</h1>

            {/* Rating row with stars card */}
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[11px] md:text-xs font-bold px-2 py-0.5 rounded leading-none">
                {product.ratings?.average || 4.1}★
              </span>
              <span className="text-xs text-slate-500 font-medium font-sans">
                ({Number(product.ratings?.count || 12).toLocaleString()} ratings)
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-3xs uppercase tracking-wider">
                Assured
              </span>
            </div>

            {/* Pricing calculations details */}
            <div className="mt-4 flex items-baseline flex-wrap gap-2">
              <span className="text-xl md:text-2.5xl font-bold text-dark-text">{formatPrice(product.price)}</span>
              <span className="text-sm text-slate-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>
              <span className="text-sm font-bold text-success-green">{product.discount}% off</span>
              <span className="text-xs font-semibold text-success-green ml-1">
                (Save {formatPrice(product.originalPrice - product.price)})
              </span>
            </div>

            {/* Stock warnings banner */}
            <div className="mt-3.5">
              {product.stock <= 5 ? (
                <span className="text-xs text-rose-500 font-extrabold uppercase animate-pulse">
                  Only {product.stock} items left in stock - Order Soon!
                </span>
              ) : (
                <span className="text-xs text-success-green font-bold uppercase select-none">
                  ✔ item in stock (Ready to dispatch)
                </span>
              )}
            </div>
          </div>

          {/* PINCODE VALIDATOR ADAPTER */}
          <div className="bg-white border border-slate-100 p-5 rounded">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Truck size={15} className="text-primary" /> Delivery Options Check
            </h3>
            
            <form onSubmit={checkPincodeDelivery} className="flex relative items-center max-w-sm">
              <span className="absolute left-3 text-slate-400"><MapPin size={16} /></span>
              <input
                type="text"
                placeholder="Enter 6-digit Delivery Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full pl-9 pr-16 py-2 border rounded text-xs select-none outline-none font-mono focus:border-primary"
              />
              <button
                type="submit"
                className="absolute right-1 text-xs font-bold text-primary px-3 py-1 bg-blue-50 rounded hover:bg-blue-100/70 transition cursor-pointer"
              >
                Check
              </button>
            </form>

            {pincodeStatus && (
              <div className="mt-3 bg-blue-50/50 p-2.5 rounded border border-blue-100 flex items-center gap-2 text-xs text-slate-700 animate-fade-in">
                <ShieldCheck size={14} className="text-[#388E3C]" />
                <span>Delivery by <strong>{pincodeStatus.deliveryDate}</strong> | FREE Delivery</span>
              </div>
            )}
          </div>

          {/* SPECS & DETAILS AND ACCORDIONS */}
          <div className="bg-white border border-slate-100 rounded p-5 flex flex-col gap-4">
            
            {/* Highlights List checkmark */}
            {highlightsList.length > 0 && (
              <div className="pb-4 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Award size={15} className="text-amber-500" /> Key Highlights
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  {highlightsList.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#388E3C] mt-0.5">✔</span>
                      <span className="leading-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Details */}
            {specsList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-primary" /> Specifications Map
                </h4>
                <div className="border border-slate-100 rounded overflow-hidden divide-y divide-slate-100">
                  {specsList.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-3 text-xs gap-3">
                      <div className="text-[#878787] font-bold font-sans">{spec.name}</div>
                      <div className="col-span-2 text-slate-800 font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RATINGS & REVIEWS SECTION */}
          <div className="bg-white border border-slate-100 rounded p-5 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
              <MessageSquare size={15} className="text-primary" /> Ratings & Reviews List
            </h3>

            {/* Custom Reviews Form */}
            <form onSubmit={handleReviewSubmission} className="bg-slate-50 border border-slate-100 p-4 rounded flex flex-col gap-3.5">
              <span className="text-xs font-bold text-slate-700">Write a Review for this product</span>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-bold">Your Rating:</span>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="rounded border p-1 border-slate-200 text-xs font-bold bg-white outline-none focus:border-primary"
                >
                  <option value={5}>5★ Excellent</option>
                  <option value={4}>4★ Good</option>
                  <option value={3}>3★ Average</option>
                  <option value={2}>2★ Below Average</option>
                  <option value={1}>1★ Poor</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="Share your detailed feedback about original seals, delivery speed, and overall builds product operations..."
                value={userReviewText}
                onChange={(e) => setUserReviewText(e.target.value)}
                className="w-full p-2.5 border rounded text-xs bg-white outline-none placeholder-slate-400 focus:border-primary"
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="self-end rounded-xs bg-[#2874F0] px-6 py-1.5 font-bold text-white text-xs uppercase shadow-xs transition active:translate-y-[1px] cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {reviewSubmitting ? 'Recording...' : 'Submit Review'}
              </button>
            </form>

            {/* List of existing customer reviews */}
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No verified purchaser reviews recorded for this product. Be the first to add!
                </div>
              ) : (
                reviewsList.map((rev, idx) => (
                  <div key={idx} className="border-b last:border-b-0 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none">
                        {rev.rating}★
                      </span>
                      <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto font-sans">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-normal pl-0.5 font-sans">
                      {rev.reviewText}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIMILAR RECOMMENDED PRODUCTS SECTION */}
          {similarProducts.length > 0 && (
            <div className="bg-white border border-slate-100 rounded p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-3 mb-4">
                Similar Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/20 p-2 rounded">
                {similarProducts.map((p) => (
                  <div key={p._id} className="min-w-0" onClick={() => setActiveImageIdx(0)}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
