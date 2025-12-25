import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartItems, addToCart as addToCartAPI, updateCartItemQuantity as updateCartItemQuantityAPI, removeFromCart as removeFromCartAPI, clearCart as clearCartAPI } from '../services/api';

const CartContext = createContext();

// Helper to check if user is logged in
const isUserLoggedIn = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    const parsedUser = JSON.parse(userData);
    return !!(parsedUser && parsedUser.token);
  } catch {
    return false;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart items from backend on component mount (only if logged in)
  useEffect(() => {
    if (isUserLoggedIn()) {
      loadCartItems();
    }
  }, []);

  const loadCartItems = async () => {
    // Only load cart if user is logged in
    if (!isUserLoggedIn()) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await getCartItems();
      setCart(response.items || []);
    } catch (err) {
      // Silently handle 403/401 errors for unauthenticated users
      if (err.message && (err.message.includes('403') || err.message.includes('401'))) {
        setCart([]);
        return;
      }
      console.error('Error loading cart items:', err);
      setError(err.message);
      // Keep local cart if API fails
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (book) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      await addToCartAPI(book.id, 1);
      
      // Update local state
      setCart((prevCart) => {
        const existing = prevCart.find((i) => i.book.id === book.id);
        if (existing) {
          return prevCart.map((i) =>
            i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevCart, { book, quantity: 1 }];
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      await updateCartItemQuantityAPI(cartItemId, quantity);
      
      // Update local state
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      await removeFromCartAPI(cartItemId);
      
      // Update local state
      setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      await clearCartAPI();
      
      // Update local state
      setCart([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.book.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      error, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      getCartTotal,
      getCartItemCount,
      loadCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
