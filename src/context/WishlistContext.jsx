import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/wishlist');
        if (res.success) {
          setItems(res.data || []);
        }
      } catch (err) {
        console.error('Failed to sync collection lists:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Please login to save items into your wishlist.');
    }
    try {
      const res = await api.post('/wishlist', { productId });
      if (res.success) {
        setItems(res.data || []);
        return { success: true, isAdded: res.data.some(p => p._id === productId) };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || 'Operation failed.' };
    }
  };

  const isInWishlist = (productId) => {
    return items.some(p => p._id?.toString() === productId?.toString() || p === productId);
  };

  return (
    <WishlistContext.Provider value={{ items, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be consumed inside a WishlistProvider.');
  }
  return context;
};

export default WishlistContext;
