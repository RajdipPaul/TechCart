import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdOutlineAccountCircle,
  MdLogout,
  MdLogin,
  MdShoppingCart,
  MdKeyboardArrowDown,
  MdReceiptLong,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import useAuth from "../context/useAuth";
import useCart from "../context/useCart";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isProductsActive = location.pathname.startsWith("/products");
  const isAIShopkeeperActive = location.pathname.startsWith("/ai-shopkeeper");
  const isCartActive = location.pathname === "/cart";
  const isContactActive = location.pathname === "/contact";

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="w-full h-24 text-[1.2rem] text-white font-outfit bg-[#344b75] flex justify-between items-center px-8 shadow-md sticky top-0 z-40">
      {/* Brand & Links */}
      <div className="flex items-center list-none gap-14">
        <Link
          to="/"
          className="text-4xl font-extrabold tracking-wide hover:opacity-95 flex items-center"
        >
          <span className="text-blue-400">Tech</span>
          <span className="text-white">Cart</span>
        </Link>
        <div className="hidden md:flex justify-center items-center gap-8 text-gray-200">
          <motion.div whileHover={{ y: -3 }}>
            <Link
              to="/products"
              className={`transition-colors ${
                isProductsActive
                  ? "text-blue-400 font-bold border-b-2 border-blue-400 pb-1"
                  : "hover:text-white"
              }`}
            >
              Products
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3 }}>
            <Link
              to="/ai-shopkeeper"
              className={`transition-colors ${
                isAIShopkeeperActive
                  ? "text-blue-400 font-bold border-b-2 border-blue-400 pb-1"
                  : "hover:text-white"
              }`}
            >
              AI Shopkeeper
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3 }}>
            <Link
              to="/contact"
              className={`transition-colors ${
                isContactActive
                  ? "text-blue-400 font-bold border-b-2 border-blue-400 pb-1"
                  : "hover:text-white"
              }`}
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Auth Actions */}
      <div className="flex justify-between items-center list-none gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 md:gap-4">
            {/* Cart Icon Link - Positioned to the left of the profile */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                aria-label={`Shopping cart with ${totalItems} items`}
                className={`relative p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isCartActive
                    ? "bg-blue-600 text-white border-blue-400 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                }`}
              >
                <MdShoppingCart className="text-2xl" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* Profile Dropdown Menu Trigger */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer transition-all focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <MdOutlineAccountCircle className="text-2xl text-emerald-300" />
                <span className="text-base font-semibold text-white max-w-[140px] truncate">
                  {user.fullName || "User"}
                </span>
                <MdKeyboardArrowDown
                  className={`text-xl text-gray-300 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Pop-up Window under Profile Name */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white text-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 flex flex-col font-outfit"
                  >
                    {/* Signed In Header */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || ""}
                      </p>
                    </div>

                    {/* Pop-up Options */}
                    <div className="flex flex-col gap-1 pt-1.5">
                      {/* Option 1: My Orders */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/orders");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#344b75]/10 text-gray-800 hover:text-[#344b75] font-semibold text-sm transition-all cursor-pointer text-left"
                      >
                        <MdReceiptLong className="text-lg text-[#344b75]" />
                        <span>My Orders</span>
                      </button>

                      {/* Option 2: Log Out */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-all cursor-pointer text-left"
                      >
                        <MdLogout className="text-lg" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Link
                to="/login"
                className="px-4 py-2.5 flex justify-center items-center font-outfit text-lg font-medium tracking-wider text-white hover:text-white/80 rounded-xl gap-2"
              >
                <MdLogin className="text-xl" />
                Log In
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Link
                to="/signup"
                className="px-4 py-2.5 flex justify-center items-center font-outfit text-lg font-medium tracking-wider border-2 border-white rounded-xl gap-2 hover:bg-[#345696ea] transition-all"
              >
                <MdOutlineAccountCircle className="text-2xl" />
                Create an Account
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
