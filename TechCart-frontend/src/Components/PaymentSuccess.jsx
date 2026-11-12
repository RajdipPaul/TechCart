import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  FaCheckCircle,
  FaReceipt,
  FaArrowRight,
  FaExclamationCircle,
  FaBoxOpen,
} from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import Navbar from "./Navbar";
import useCart from "../context/useCart";
import { orderAPI, getApiErrorMessage } from "../services/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // PayPal Order ID
  const payerId = searchParams.get("PayerID");

  const { fetchCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    // Avoid double invocation in React 19 strict mode
    if (hasCapturedRef.current) return;
    hasCapturedRef.current = true;

    const processPayment = async () => {
      try {
        setLoading(true);

        // 1. Determine the TechCart internal orderId
        let targetOrderId = sessionStorage.getItem("techcart_pending_order_id");

        // If not in session storage or if token is present, resolve via order history
        if (!targetOrderId || isNaN(Number(targetOrderId))) {
          try {
            const orders = await orderAPI.getAll();
            const orderList = Array.isArray(orders) ? orders : [];
            // Match by paypalOrderId if token is available
            const matchedOrder = token
              ? orderList.find((o) => o.paypalOrderId === token)
              : orderList[0];

            if (matchedOrder) {
              targetOrderId = matchedOrder.orderId;
            }
          } catch (fetchErr) {
            console.warn("Could not retrieve order list for PayPal token resolution:", fetchErr);
          }
        }

        if (!targetOrderId) {
          throw new Error("Unable to locate order reference. Please check your order history.");
        }

        // 2. Capture the PayPal payment on the backend
        let capturedOrder;
        try {
          capturedOrder = await orderAPI.capturePayPalPayment(targetOrderId);
        } catch (captureErr) {
          // If already paid or captured, fetch the existing order details
          const existingOrder = await orderAPI.getById(targetOrderId).catch(() => null);
          if (existingOrder && existingOrder.paymentStatus === "PAID") {
            capturedOrder = existingOrder;
          } else {
            throw captureErr;
          }
        }

        setOrder(capturedOrder);

        // 3. Clear session storage pending order
        sessionStorage.removeItem("techcart_pending_order_id");
        sessionStorage.removeItem("techcart_pending_order_number");

        // 4. Refresh global cart state so cart badge resets to 0
        if (fetchCart) {
          await fetchCart();
        }
      } catch (err) {
        console.error("Payment capture failure:", err);
        setError(getApiErrorMessage(err, "Failed to capture PayPal payment"));
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [token, payerId, fetchCart]);

  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-2xl bg-white border-2 border-[#344b75]/20 rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-10 sm:p-14 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 border-4 border-[#344b75] border-t-transparent rounded-full animate-spin" />
              <h2 className="text-2xl font-bold text-[#1e293b]">
                Finalizing Your Payment...
              </h2>
              <p className="text-gray-600 text-sm max-w-md">
                Verifying PayPal transaction and updating stock records. Please do not refresh or close this tab.
              </p>
            </div>
          ) : error ? (
            <div className="p-8 sm:p-12 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl">
                <FaExclamationCircle />
              </div>
              <h2 className="text-2xl font-bold text-red-600">
                Payment Verification Notice
              </h2>
              <p className="text-gray-700 text-sm max-w-md bg-red-50 p-4 rounded-xl border border-red-200">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
                <Link
                  to="/cart"
                  className="px-6 py-3 bg-[#344b75] text-white rounded-xl font-semibold shadow-md hover:bg-[#293b5d] transition-all text-sm text-center"
                >
                  Return to Cart
                </Link>
                <Link
                  to="/products"
                  className="px-6 py-3 border-2 border-[#344b75] text-[#344b75] rounded-xl font-semibold hover:bg-[#344b75] hover:text-white transition-all text-sm text-center"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 flex flex-col gap-6"
            >
              {/* Header Badge */}
              <div className="flex flex-col items-center text-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
                  <FaCheckCircle />
                </div>
                <h1 className="text-3xl font-extrabold text-[#1e293b]">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 text-sm max-w-md">
                  Thank you for your purchase. Your payment was captured via PayPal Sandbox and your order is confirmed.
                </p>
              </div>

              {/* Order Meta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5 mb-1">
                    <FaReceipt className="text-[#344b75]" /> Order Reference
                  </span>
                  <span className="text-lg font-bold text-[#1e293b] font-mono">
                    {order?.orderNumber || "TC-ORDER"}
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      STATUS: {order?.orderStatus || "CONFIRMED"}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      PAYMENT: {order?.paymentStatus || "PAID"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5 mb-1">
                    <FaTruckFast className="text-[#344b75]" /> Shipping Destination
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    {order?.shippingAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">
                    {order?.postalCode}, {order?.country}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {order?.items && order.items.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaBoxOpen className="text-[#344b75]" /> Items In This Order
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div
                        key={item.oItemId || idx}
                        className="p-3.5 bg-slate-50 flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.pName}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-gray-900 truncate">
                              {item.pName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-[#344b75] whitespace-nowrap">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-4 bg-[#344b75]/5 border border-[#344b75]/20 rounded-2xl flex items-center justify-between">
                <span className="text-base font-bold text-[#1e293b]">
                  Total Amount Paid
                </span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#344b75]">
                    ₹{Number(order?.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Paid via PayPal Sandbox
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/products"
                  className="flex-1 py-3.5 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Continue Shopping</span>
                  <FaArrowRight />
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3.5 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75] hover:text-white rounded-xl font-bold transition-all text-center"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
