import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoClose } from "react-icons/io5";
import {
  FaReceipt,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaPaypal,
} from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-hot-toast";
import { getProductImageUrl, orderAPI, getApiErrorMessage } from "../services/api";

const OrderDetailModal = ({ order, isOpen, onClose, onOrderCancelled }) => {
  const modalRef = useRef(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

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

  const isPaid = (order.paymentStatus || "").toUpperCase() === "PAID";
  const isConfirmed =
    (order.orderStatus || "").toUpperCase() === "CONFIRMED";
  const isPending = !isPaid;

  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    try {
      sessionStorage.setItem("techcart_pending_order_id", String(order.orderId));
      sessionStorage.setItem("techcart_pending_order_number", order.orderNumber);

      // If order already has a PayPal order ID associated, redirect to PayPal checkout
      if (order.paypalOrderId) {
        toast.loading("Redirecting to PayPal Sandbox checkout...", { duration: 3000 });
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${order.paypalOrderId}`;
        return;
      }

      // Otherwise, request creation of PayPal checkout from backend
      const data = await orderAPI.createPayPalOrder(order.orderId);
      if (data?.approvalUrl) {
        toast.loading("Redirecting to PayPal Sandbox checkout...", { duration: 3000 });
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL returned from PayPal service.");
      }
    } catch (err) {
      console.error("Complete payment error:", err);
      if (order.paypalOrderId) {
        toast.loading("Redirecting to PayPal Sandbox checkout...", { duration: 3000 });
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${order.paypalOrderId}`;
        return;
      }
      toast.error(getApiErrorMessage(err, "Failed to initialize PayPal checkout"));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !window.confirm(
        `Are you sure you want to cancel and delete order #${order.orderNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsCancellingOrder(true);
    try {
      await orderAPI.deleteOrder(order.orderId);
      toast.success(`Order #${order.orderNumber} cancelled and removed`);
      if (onOrderCancelled) {
        onOrderCancelled(order.orderId);
      }
      onClose();
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(getApiErrorMessage(err, "Failed to cancel order"));
    } finally {
      setIsCancellingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-3xl bg-white text-[#1e293b] border-2 border-[#344b75]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-outfit relative"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-gray-200 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#344b75] bg-[#344b75]/10 px-2.5 py-1 rounded-md">
                  Order Details
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    isConfirmed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isConfirmed ? <FaCheckCircle className="text-[10px]" /> : <FaClock className="text-[10px]" />}
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
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] font-mono tracking-tight">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer border border-gray-300 shadow-sm shrink-0"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            {/* Delivery & Customer Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F0EAD6]/30 border border-[#344b75]/15 p-5 rounded-2xl">
              <div>
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5 mb-2">
                  <FaTruckFast className="text-[#344b75]" /> Shipping Destination
                </span>
                <p className="text-sm font-semibold text-[#1e293b] leading-snug">
                  {order.shippingAddress || "N/A"}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {order.postalCode ? `Pin Code: ${order.postalCode}, ` : ""}
                  {order.country || "India"}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5 mb-2">
                  <FaReceipt className="text-[#344b75]" /> Customer Information
                </span>
                <p className="text-sm font-semibold text-[#1e293b]">
                  {order.customerName || "Customer"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {order.customerMail}
                </p>
                {order.customerPhone && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Phone: {order.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <FaBoxOpen className="text-[#344b75]" /> Items in this Order ({order.items?.length || 0})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div
                      key={item.oItemId || idx}
                      className="p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={getProductImageUrl(item.imageUrl)}
                            alt={item.pName || "Product"}
                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                            <FaBoxOpen className="text-xl" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-[#1e293b] text-base truncate">
                            {item.pName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Quantity: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-[#344b75]">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No item details available.
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Total Breakdown */}
            <div className="bg-slate-50 border border-gray-200 p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated GST / Taxes</span>
                <span className="font-semibold text-gray-500">Included</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Shipping & Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#1e293b]">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#344b75]">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Approx. ${((order.totalAmount || 0) / 93.93).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* PayPal Sandbox Reference Badge */}
              {order.paypalOrderId && (
                <div className="mt-2 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium text-blue-700">
                    <FaPaypal className="text-sm" /> PayPal Sandbox Transaction
                  </span>
                  <span className="font-mono text-gray-600">
                    Ref: {order.paypalOrderId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-5 bg-slate-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isPending && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancellingOrder || isProcessingPayment}
                  className="px-4 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <MdDeleteOutline className="text-lg" />
                  <span>{isCancellingOrder ? "Cancelling..." : "Cancel Order"}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isPending && (
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={isProcessingPayment || isCancellingOrder}
                  className="px-6 py-2.5 bg-[#0070BA] hover:bg-[#003087] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to PayPal...</span>
                    </>
                  ) : (
                    <>
                      <FaPaypal className="text-base text-blue-200" />
                      <span>Complete Payment</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={isProcessingPayment || isCancellingOrder}
                className="px-6 py-2.5 bg-[#344b75] hover:bg-[#293b5d] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;
