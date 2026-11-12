import { motion } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdOutlineAccountCircle, MdLogout, MdLogin, MdShoppingCart } from "react-icons/md";
import { toast } from "react-hot-toast";
import useAuth from "../context/useAuth";
import useCart from "../context/useCart";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const isProductsActive = location.pathname.startsWith("/products");
  const isCartActive = location.pathname === "/cart";

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
            <Link to="/" className="hover:text-white transition-colors">
              AI Shopkeeper
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3 }}>
            <Link to="/" className="hover:text-white transition-colors">
              How It Works
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3 }}>
            <Link to="/" className="hover:text-white transition-colors">
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

            {/* Profile Badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
              <MdOutlineAccountCircle className="text-2xl text-emerald-300" />
              <span className="text-lg font-medium text-white max-w-[150px] truncate">
                {user.fullName || "User"}
              </span>
            </div>

            {/* Log Out Button */}
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 flex items-center font-outfit text-base font-medium tracking-wide border border-white/60 hover:border-white rounded-xl gap-2 cursor-pointer transition-colors bg-red-600/30 hover:bg-red-600/50"
            >
              <MdLogout className="text-lg" />
              Log Out
            </motion.button>
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
                Create Account
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
