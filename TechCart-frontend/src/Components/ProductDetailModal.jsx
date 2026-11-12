import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoClose } from "react-icons/io5";
import { FaShoppingCart, FaBolt, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import useCart from "../context/useCart";
import { getProductImageUrl, getApiErrorMessage } from "../services/api";

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const modalRef = useRef(null);

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

  if (!isOpen || !product) return null;

  const productId = product.pId ?? product.pid;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in or create an account to add items to your cart!", {
        duration: 4000,
        icon: "🔒",
      });
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success(`Added ${product.pName || product.name} to your cart!`, {
        icon: "🛒",
      });
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add product to cart"));
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in or sign up before purchasing!", {
        duration: 4000,
        icon: "🔒",
      });
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success(`Item added! Proceeding to cart...`, {
        icon: "⚡",
      });
      onClose();
      navigate("/cart");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Checkout initiation failed"));
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
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-5xl bg-white text-[#1e293b] border-2 border-[#344b75]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-outfit relative"
        >
          {/* Header Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer border border-gray-300 shadow-sm"
          >
            <IoClose className="text-2xl" />
          </button>

          {/* Modal Content - Two Column Layout Matching Pic-2 */}
          <div className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
            {/* Left: Product Image in Highlighted Container */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <div className="w-full aspect-square max-h-[420px] rounded-2xl border-2 border-[#344b75]/40 p-2 bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm relative group">
                <img
                  src={getProductImageUrl(product.imageUrl)}
                  alt={product.pName || "Product"}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-[#344b75] text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20 flex items-center gap-1.5 shadow-md">
                  <FaCheckCircle className="text-xs text-emerald-300" />
                  <span>In Stock: {product.stockQuantity} units</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details, Specs & Action Buttons */}
            <div className="w-full md:w-1/2 flex flex-col justify-between gap-6">
              <div>
                {/* Category & Brand pill */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#344b75] bg-[#344b75]/10 px-2.5 py-1 rounded-md border border-[#344b75]/20">
                    {product.brand}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1e293b] mb-3">
                  {product.pName}
                </h2>

                {/* Product Description */}
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Product Price */}
                <div className="text-3xl font-extrabold text-[#344b75] mb-6 flex items-baseline gap-2">
                  <span>
                    ₹{Number(product.price).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm font-normal text-gray-500">
                    ({product.currency})
                  </span>
                </div>

                {/* Product Specifications Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                    <span>Product Specification</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    {product.processor && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Processor</span>
                        <span className="font-semibold text-gray-800">{product.processor}</span>
                      </div>
                    )}
                    {product.ramGb && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Memory (RAM)</span>
                        <span className="font-semibold text-gray-800">{product.ramGb} GB</span>
                      </div>
                    )}
                    {product.storageGb && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Storage</span>
                        <span className="font-semibold text-gray-800">
                          {product.storageGb} GB {product.storageType || "SSD"}
                        </span>
                      </div>
                    )}
                    {product.graphics && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Graphics</span>
                        <span className="font-semibold text-gray-800">{product.graphics}</span>
                      </div>
                    )}
                    {product.displaySizeInches && product.displaySizeInches > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Display</span>
                        <span className="font-semibold text-gray-800">
                          {product.displaySizeInches}" {product.displayReso || ""}
                        </span>
                      </div>
                    )}
                    {product.batteryWh && product.batteryWh > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Battery</span>
                        <span className="font-semibold text-gray-800">{product.batteryWh} Wh</span>
                      </div>
                    )}
                    {product.weightKg && product.weightKg > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-500 block text-xs">Weight</span>
                        <span className="font-semibold text-gray-800">{product.weightKg} kg</span>
                      </div>
                    )}
                    {product.connectivity && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                        <span className="text-gray-500 block text-xs">Connectivity</span>
                        <span className="font-semibold text-gray-800">{product.connectivity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to cart & Buy Now */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-1/2 py-3.5 px-6 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75] hover:text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-lg shadow-sm"
                >
                  <FaShoppingCart className="text-base" />
                  <span>Add to cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full sm:w-1/2 py-3.5 px-6 bg-[#344b75] hover:bg-[#293b5d] text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-lg shadow-md hover:shadow-lg"
                >
                  <FaBolt className="text-base" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
