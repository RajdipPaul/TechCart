import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FaShoppingCart, FaArrowLeft, FaBan } from "react-icons/fa";
import Navbar from "./Navbar";

const PaymentCancel = () => {
  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-white border-2 border-[#344b75]/20 rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center text-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner">
            <FaBan />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
              You cancelled the PayPal payment flow. Your cart items and order record remain intact so you can resume whenever you are ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Link
              to="/cart"
              className="flex-1 py-3.5 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <FaShoppingCart className="text-base" />
              <span>Back to Cart</span>
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3.5 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75] hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentCancel;
