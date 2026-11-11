import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineSmartToy } from "react-icons/md";

const Herosection = () => {
  return (
    <div className="h-[calc(100vh-96px)] bg-[#F0EAD6] flex flex-col justify-center items-center text-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col justify-center items-center gap-8 max-w-4xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#344b75]/10 text-[#344b75] font-semibold text-sm tracking-wider uppercase">
          <MdOutlineSmartToy className="text-lg" />
          Next-Gen AI E-Commerce Shopping Experience
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold font-outfit text-[#1e293b] leading-tight">
          Find Your Perfect Tech Setup with Our{" "}
          <span className="text-[#344b75] underline decoration-wavy decoration-[#8b5cf6]/60">
            AI Shopkeeper
          </span>
        </h1>

        <p className="text-xl text-gray-700 font-outfit max-w-2xl">
          Compare specifications, get tailored recommendations, and checkout
          seamlessly via PayPal. Powered by intelligent hardware matching.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            to="/signup"
            className="px-6 py-3.5 bg-[#344b75] hover:bg-[#345696ea] text-white text-lg font-medium rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            Get Started Now
            <FaArrowRight className="text-base" />
          </Link>
          <button
            type="button"
            className="px-6 py-3.5 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75]/5 text-lg font-medium rounded-xl transition-all duration-300 cursor-pointer"
          >
            Talk to AI Assistant
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Herosection;
