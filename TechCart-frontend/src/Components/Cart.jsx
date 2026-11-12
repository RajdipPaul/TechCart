import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  MdOutlineRemoveShoppingCart,
  MdDeleteOutline,
  MdArrowBack,
  MdAdd,
  MdRemove,
  MdLock,
} from "react-icons/md";
import { FaPaypal } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import AddressModal from "./AddressModal";
import useAuth from "../context/useAuth";
import useCart from "../context/useCart";
import { getProductImageUrl, getApiErrorMessage, orderAPI } from "../services/api";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const {
    cart,
    loading,
    totalItems,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update quantity"));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to remove item"));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      try {
        await clearCart();
        toast.success("Cart cleared");
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to clear cart"));
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to proceed with checkout!");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty! Add products before checking out.");
      return;
    }
    setIsAddressModalOpen(true);
  };

  const handleConfirmAddressAndCheckout = async (addressData) => {
    setIsCheckingOut(true);
    try {
      // 1. Send address to DB to store via createOrder
      const order = await orderAPI.createOrder(addressData);
      sessionStorage.setItem("techcart_pending_order_id", String(order.orderId));
      sessionStorage.setItem("techcart_pending_order_number", order.orderNumber);

      toast.success(
        `Order #${order.orderNumber} created! Address saved to database.`,
        { icon: "📦" }
      );

      // 2. Initialize PayPal Sandbox checkout
      try {
        const paypalData = await orderAPI.createPayPalOrder(order.orderId);
        if (paypalData?.approvalUrl) {
          toast.loading("Redirecting to PayPal Sandbox checkout...", {
            duration: 3000,
          });
          setIsAddressModalOpen(false);
          window.location.href = paypalData.approvalUrl;
          return;
        }
      } catch (paypalErr) {
        console.warn("PayPal checkout initialization note:", paypalErr);
        toast.success(
          `Order #${order.orderNumber} placed successfully with status PENDING.`,
          { duration: 5000 }
        );
      }

      setIsAddressModalOpen(false);
    } catch (err) {
      console.error("Order creation error:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to save address and create order")
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // If user is not authenticated, show friendly sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border-2 border-[#344b75]/20 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#344b75]/10 text-[#344b75] flex items-center justify-center text-4xl shadow-inner">
              <MdLock />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1e293b]">
              Your Cart is Private
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To keep your items synchronized across all your devices, please log in or
              create a free account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/login"
                state={{ from: "/cart" }}
                className="w-full py-3 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl font-semibold shadow-md transition-all text-center"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="w-full py-3 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75] hover:text-white rounded-xl font-semibold transition-all text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Navigation & Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#344b75]/20">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Link to="/products" className="hover:text-[#344b75] flex items-center gap-1">
                <MdArrowBack /> Back to Catalog
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b]">
              Your Shopping Cart
            </h1>
          </div>

          {totalItems > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <MdDeleteOutline className="text-lg" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="w-full h-80 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#344b75] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty Cart State */
          <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-6 bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-[#344b75]/30 p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[#344b75]/10 text-[#344b75] flex items-center justify-center text-5xl">
              <MdOutlineRemoveShoppingCart />
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
                Your cart is currently empty
              </h2>
              <p className="text-gray-600 text-sm">
                Looks like you haven`t added any laptops, smartphones, or accessories yet.
              </p>
            </div>
            <Link
              to="/products"
              className="px-8 py-3.5 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* Two Column Cart Layout */
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Items List */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              {cart.items.map((item) => {
                const itemId = item.cItemsId ?? item.citemsId;
                const isItemUSD = (item.currency || cart?.currency || "").toUpperCase() === "USD";
                const itemSymbol = isItemUSD ? "$" : "₹";
                return (
                  <motion.div
                    key={itemId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-md flex flex-col sm:flex-row items-center gap-5 justify-between"
                  >
                    {/* Product Thumbnail & Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-200 overflow-hidden bg-slate-50 shrink-0 p-1">
                        <img
                          src={getProductImageUrl(item.imageUrl)}
                          alt={item.pName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#344b75] bg-[#344b75]/10 px-2 py-0.5 rounded w-fit">
                          {item.brand || item.category}
                        </span>
                        <h3 className="text-lg font-bold text-[#1e293b] line-clamp-1">
                          {item.pName}
                        </h3>
                        <div className="text-sm font-semibold text-gray-500">
                          {itemSymbol}{Number(item.price).toLocaleString(isItemUSD ? "en-US" : "en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Quantity Buttons */}
                      <div className="flex items-center border border-gray-300 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              handleRemoveItem(itemId);
                            } else {
                              handleUpdateQuantity(itemId, item.quantity - 1);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <MdRemove className="text-sm" />
                        </button>
                        <span className="w-9 text-center font-bold text-sm text-[#1e293b]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <MdAdd className="text-sm" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-lg font-extrabold text-[#344b75] min-w-[100px] text-right">
                        {itemSymbol}{Number(item.subtotal).toLocaleString(isItemUSD ? "en-US" : "en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>

                      {/* Delete Item Button */}
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => handleRemoveItem(itemId)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <MdDeleteOutline className="text-xl" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="w-full lg:w-1/3 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#344b75]/20 shadow-xl flex flex-col gap-6 sticky top-28">
              <h2 className="text-2xl font-bold text-[#1e293b] pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-[#1e293b]">{totalItems}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1e293b]">
                    {(cart?.currency || "").toUpperCase() === "USD" ? "$" : "₹"}
                    {Number(totalAmount).toLocaleString((cart?.currency || "").toUpperCase() === "USD" ? "en-US" : "en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping & Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated GST</span>
                  <span className="text-gray-500">Included</span>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-lg font-bold text-[#1e293b]">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#344b75]">
                      {(cart?.currency || "").toUpperCase() === "USD" ? "$" : "₹"}
                      {Number(totalAmount).toLocaleString((cart?.currency || "").toUpperCase() === "USD" ? "en-US" : "en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="block text-[11px] text-gray-500 font-medium">
                      {(cart?.currency || "").toUpperCase() === "USD"
                        ? `USD (approx. ₹${Math.round(Number(totalAmount) * 93.93).toLocaleString("en-IN")})`
                        : "INR (Indian Rupees)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <FaPaypal className="text-xl text-blue-300" />
                <span>Proceed to Checkout</span>
              </button>

              <div className="flex flex-col gap-2 pt-2 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center gap-1.5 text-gray-600 font-medium">
                  <MdLock className="text-sm text-emerald-600" />
                  <span>Encrypted PayPal Sandbox Checkout</span>
                </div>
                <span>Server-verified stock & totals per session</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shipping Address Modal Matching Hand-Drawn Spec */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleConfirmAddressAndCheckout}
        isSubmitting={isCheckingOut}
      />
    </div>
  );
};

export default Cart;
