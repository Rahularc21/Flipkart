import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync state whenever authorization changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setItems([]);
        setSubtotal(0);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/cart');
        if (res.success) {
          setItems(res.data.items || []);
          setSubtotal(res.data.subtotal || 0);
        }
      } catch (err) {
        console.error('Failed to sync shopping cart:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to modify your shopping cart.');
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.success) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || 'Cart operation failed.' };
    }
  };

  const updateQty = async (itemId, quantity) => {
    if (!user) return;
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.success) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (err) {
      console.error('Failed updating item quantity:', err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.success) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (err) {
      console.error('Failed removing cart item:', err.message);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await api.delete('/cart');
      if (res.success) {
        setItems([]);
        setSubtotal(0);
      }
    } catch (err) {
      console.error('Failed cleaning cart:', err.message);
    }
  };

  // Aggregated values
  const cartCount = items.reduce((acc, obj) => acc + (obj.quantity || 0), 0);
  const cartTotal = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be consumed inside a CartProvider.');
  }
  return context;
};

export default CartContext;
