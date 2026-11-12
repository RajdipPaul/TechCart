import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FaReceipt,
  FaBoxOpen,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { FaRotateRight } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import OrderDetailModal from "./OrderDetailModal";
import useAuth from "../context/useAuth";
import { orderAPI, getProductImageUrl, getApiErrorMessage } from "../services/api";

const MyOrders = () => {
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const data = await orderAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(getApiErrorMessage(err, "Failed to load orders. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const isMounted = { current: true };
    orderAPI
      .getAll()
      .then((data) => {
        if (isMounted.current) {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          console.error("Failed to fetch orders:", err);
          setError(
            getApiErrorMessage(err, "Failed to load orders. Please try again.")
          );
          setLoading(false);
        }
      });
    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated]);

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleCancelOrderDirect = async (e, order) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to cancel and delete order #${order.orderNumber}?`
      )
    ) {
      return;
    }
    try {
      await orderAPI.deleteOrder(order.orderId);
      toast.success(`Order #${order.orderNumber} cancelled and removed`);
      setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(getApiErrorMessage(err, "Failed to cancel order"));
    }
  };

  // If user is not authenticated, prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border-2 border-[#344b75]/20 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#344b75]/10 text-[#344b75] flex items-center justify-center text-4xl shadow-inner">
              <FaLock />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1e293b]">
              Orders Require Sign-In
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please log in to your account to view your order history and track past purchases.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/login"
                state={{ from: "/orders" }}
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

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-10 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#344b75]/20">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#344b75] text-white flex items-center justify-center text-xl shadow-md">
                <FaReceipt />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b]">
                My Orders
              </h1>
              {!loading && (
                <span className="bg-[#344b75]/10 text-[#344b75] text-sm font-bold px-3 py-1 rounded-full border border-[#344b75]/20">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">
              View your order history, delivery details, and items summary
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <FaRotateRight className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/products"
              className="px-4 py-2 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Shop More</span>
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 border-4 border-[#344b75] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium text-sm">
              Retrieving your order history from database...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="py-16 px-6 bg-white border-2 border-[#344b75]/20 rounded-3xl shadow-lg flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center text-4xl">
              <FaBoxOpen />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b]">
                No Orders Placed Yet
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mt-1">
                Your order history is currently empty. Explore our hardware catalog to place your first order!
              </p>
            </div>
            <Link
              to="/products"
              className="px-6 py-3 bg-[#344b75] hover:bg-[#293b5d] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>Explore Products</span>
              <FaArrowRight />
            </Link>
          </div>
        )}

        {/* Clickable Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const isPaid = (order.paymentStatus || "").toUpperCase() === "PAID";
              const isConfirmed = (order.orderStatus || "").toUpperCase() === "CONFIRMED";
              const itemCount = (order.items || []).reduce(
                (sum, it) => sum + (it.quantity || 1),
                0
              );

              return (
                <motion.div
                  key={order.orderId}
                  whileHover={{ y: -3, scale: 1.005 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-white border-2 border-[#344b75]/20 hover:border-[#344b75] rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col gap-4 group"
                >
                  {/* Card Top: Order Number, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-lg sm:text-xl text-[#344b75] group-hover:text-blue-600 transition-colors">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                          isConfirmed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isConfirmed ? (
                          <FaCheckCircle className="text-[10px]" />
                        ) : (
                          <FaClock className="text-[10px]" />
                        )}
                        {order.orderStatus || "PENDING"}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          isPaid
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        PAYMENT: {order.paymentStatus || "PENDING"}
                      </span>

                      {!isPaid && (
                        <button
                          type="button"
                          onClick={(e) => handleCancelOrderDirect(e, order)}
                          title="Cancel and remove pending order"
                          className="px-2.5 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <MdDeleteOutline className="text-sm" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Middle: Items Preview */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar py-1">
                      {order.items && order.items.length > 0 ? (
                        order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={item.oItemId || idx}
                            className="relative flex items-center gap-2 bg-slate-50 border border-gray-200 p-1.5 rounded-xl shrink-0"
                            title={item.pName}
                          >
                            {item.imageUrl ? (
                              <img
                                src={getProductImageUrl(item.imageUrl)}
                                alt={item.pName}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                <FaBoxOpen />
                              </div>
                            )}
                            <div className="pr-2 max-w-[140px] truncate">
                              <p className="text-xs font-bold text-gray-800 truncate">
                                {item.pName}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          Items details saved in database
                        </span>
                      )}

                      {order.items && order.items.length > 4 && (
                        <span className="text-xs font-bold text-[#344b75] bg-[#344b75]/10 px-2.5 py-2 rounded-xl">
                          +{order.items.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Card Right: Total & View Details Action */}
                    <div className="flex items-center gap-5 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] font-semibold uppercase text-gray-500 block">
                          Total Amount ({itemCount} {itemCount === 1 ? "item" : "items"})
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#344b75]">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#344b75] font-bold text-sm group-hover:translate-x-1 transition-transform">
                        <span>Details</span>
                        <FaChevronRight className="text-xs" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detailed Order View Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderCancelled={(cancelledId) => {
          setOrders((prev) => prev.filter((o) => o.orderId !== cancelledId));
        }}
      />
    </div>
  );
};

export default MyOrders;
