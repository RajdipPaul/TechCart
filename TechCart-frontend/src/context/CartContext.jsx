import { useState, useEffect, useCallback } from "react";
import CartContext from "./cartContextInstance";
import useAuth from "./useAuth";
import { cartAPI } from "../services/api";

const EMPTY_CART = {
  cartId: null,
  status: "ACTIVE",
  currency: "INR",
  items: [],
  totalItems: 0,
  totalAmount: 0.0,
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  // Synchronize cart on authentication change
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      return;
    }

    const loadUserCart = async () => {
      try {
        setLoading(true);
        const data = await cartAPI.getCart();
        if (isMounted) {
          setCart(data);
        }
      } catch (err) {
        console.warn("Failed to load user cart:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart(data);
    } catch (err) {
      console.warn("Failed to refresh cart:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add Item
  const addToCart = async (pId, quantity = 1) => {
    const updated = await cartAPI.addItem(pId, quantity);
    setCart(updated);
    return updated;
  };

  // Update Item Quantity
  const updateQuantity = async (cItemsId, quantity) => {
    const updated = await cartAPI.updateItemQuantity(cItemsId, quantity);
    setCart(updated);
    return updated;
  };

  // Remove Item
  const removeFromCart = async (cItemsId) => {
    const updated = await cartAPI.removeItem(cItemsId);
    setCart(updated);
    return updated;
  };

  // Clear Entire Cart
  const clearCart = async () => {
    const updated = await cartAPI.clearCart();
    setCart(updated);
    return updated;
  };

  const activeCart = isAuthenticated ? cart : EMPTY_CART;

  const value = {
    cart: activeCart,
    loading,
    totalItems: activeCart?.totalItems || 0,
    totalAmount: activeCart?.totalAmount || 0.0,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
