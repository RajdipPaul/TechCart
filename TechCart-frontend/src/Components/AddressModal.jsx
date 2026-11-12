import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoClose } from "react-icons/io5";
import { FaTruckFast } from "react-icons/fa6";

const AddressModal = ({ isOpen, onClose, onConfirm, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    shippingAddress: "",
    postalCode: "",
    country: "India",
  });
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Pin Code is required";
    } else if (formData.postalCode.trim().length < 4) {
      newErrors.postalCode = "Please enter a valid pin code";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    onConfirm({
      shippingAddress: formData.shippingAddress.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim(),
    });
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (modalRef.current && !modalRef.current.contains(e.target) && !isSubmitting) {
            handleClose();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-lg bg-[#1e293b] text-white border-2 border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 font-outfit relative"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close address modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <IoClose className="text-xl" />
          </button>

          {/* Form Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#344b75] border border-white/20 flex items-center justify-center text-white text-base shadow-sm">
              <FaTruckFast />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Delivery Details
              </h2>
              <p className="text-xs text-gray-400">
                Provide your destination address to complete order checkout
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 1. Shipping Address Field (matching user drawing) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="shippingAddress"
                className="text-base font-semibold text-gray-200 tracking-wide"
              >
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows={3}
                value={formData.shippingAddress}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="House / Flat No., Street, Area, Landmark"
                className={`w-full px-4 py-3 bg-white/5 border-2 ${
                  errors.shippingAddress
                    ? "border-red-400 focus:border-red-500"
                    : "border-white/20 focus:border-white/60"
                } rounded-xl outline-none text-white placeholder-gray-500 font-medium text-sm transition-all resize-none`}
              />
              {errors.shippingAddress && (
                <span className="text-xs text-red-400 mt-0.5">
                  {errors.shippingAddress}
                </span>
              )}
            </div>

            {/* 2. Pin Code and Country side-by-side row (matching user drawing) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pin Code */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="postalCode"
                  className="text-base font-semibold text-gray-200 tracking-wide"
                >
                  Pin Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  maxLength={10}
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. 560001"
                  className={`w-full px-4 py-2.5 bg-white/5 border-2 ${
                    errors.postalCode
                      ? "border-red-400 focus:border-red-500"
                      : "border-white/20 focus:border-white/60"
                  } rounded-xl outline-none text-white placeholder-gray-500 font-medium text-sm transition-all`}
                />
                {errors.postalCode && (
                  <span className="text-xs text-red-400 mt-0.5">
                    {errors.postalCode}
                  </span>
                )}
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="country"
                  className="text-base font-semibold text-gray-200 tracking-wide"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. India"
                  className={`w-full px-4 py-2.5 bg-white/5 border-2 ${
                    errors.country
                      ? "border-red-400 focus:border-red-500"
                      : "border-white/20 focus:border-white/60"
                  } rounded-xl outline-none text-white placeholder-gray-500 font-medium text-sm transition-all`}
                />
                {errors.country && (
                  <span className="text-xs text-red-400 mt-0.5">
                    {errors.country}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Action Buttons (matching user drawing bottom right layout) */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border-2 border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-white text-[#1e293b] hover:bg-gray-100 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#1e293b] border-t-transparent rounded-full animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <span>Confirm address and Checkout</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddressModal;
