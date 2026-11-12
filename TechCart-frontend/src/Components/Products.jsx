import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { FaSearch, FaCheck, FaTimes, FaExclamationTriangle, FaRedo } from "react-icons/fa";
import Navbar from "./Navbar";
import ProductDetailModal from "./ProductDetailModal";
import { productAPI, getProductImageUrl, getApiErrorMessage } from "../services/api";

const PRICE_FILTERS = [
  { id: "p50000", label: "more than 50000", check: (p) => p.price >= 50000 },
  { id: "p40000", label: "more than 40000", check: (p) => p.price >= 40000 && p.price < 50000 },
  { id: "p30000", label: "more than 30000", check: (p) => p.price >= 30000 && p.price < 40000 },
  { id: "p20000", label: "more than 20000", check: (p) => p.price >= 20000 && p.price < 30000 },
  { id: "pless20000", label: "less than 20000", check: (p) => p.price < 20000 },
];

const CATEGORIES = ["Laptops", "Smartphones", "Tablets", "Pc", "All"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products from live API
  const fetchProducts = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await productAPI.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(getApiErrorMessage(err, "Failed to load products from server."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    productAPI
      .getAll()
      .then((data) => {
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load products:", err);
          setError(getApiErrorMessage(err, "Failed to load products from server."));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Category filter toggle
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Handle Price range checkbox toggle
  const handlePriceToggle = (priceId) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(priceId)
        ? prev.filter((id) => id !== priceId)
        : [...prev, priceId]
    );
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedPriceRanges([]);
    setSearchTerm("");
  };

  // Compute filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter
      if (
        selectedCategory !== "All" &&
        product.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // 2. Price Range Filter
      if (selectedPriceRanges.length > 0) {
        const matchesAnyPrice = selectedPriceRanges.some((rangeId) => {
          const filter = PRICE_FILTERS.find((f) => f.id === rangeId);
          return filter ? filter.check(product) : true;
        });
        if (!matchesAnyPrice) return false;
      }

      // 3. Search Keyword Filter
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        const matches =
          product.pName.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          (product.processor && product.processor.toLowerCase().includes(term));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedPriceRanges, searchTerm]);

  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container - Sidebar Filters on Left & Product Grid on Right (Pic-1) */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* ================= LEFT SIDEBAR: FILTERS ================= */}
        <aside className="w-full lg:w-72 p-6 border-b lg:border-b-0 lg:border-r border-[#344b75]/20 bg-white/70 backdrop-blur-md shrink-0 flex flex-col gap-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-wider capitalize text-[#1e293b]">
              filters
            </h2>
            {(selectedCategory !== "All" ||
              selectedPriceRanges.length > 0 ||
              searchTerm) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#344b75] hover:text-[#1d4ed8] font-semibold underline cursor-pointer flex items-center gap-1"
              >
                <FaTimes className="text-[10px]" />
                Reset
              </button>
            )}
          </div>

          {/* 1. Sort by Price */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-gray-700">
              Sort by Price:
            </h3>
            <div className="flex flex-col gap-2.5">
              {PRICE_FILTERS.map((item) => {
                const isChecked = selectedPriceRanges.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-black cursor-pointer select-none group"
                  >
                    <div
                      onClick={() => handlePriceToggle(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-[#344b75] border-[#344b75] text-white"
                          : "border-gray-400 group-hover:border-[#344b75] bg-white"
                      }`}
                    >
                      {isChecked && <FaCheck className="text-[10px]" />}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Sort by Category */}
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-gray-700">
              Sort by Category:
            </h3>
            <div className="flex flex-col gap-2.5">
              {CATEGORIES.map((category) => {
                const isChecked = selectedCategory === category;
                return (
                  <label
                    key={category}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-black cursor-pointer select-none group"
                  >
                    <div
                      onClick={() => handleCategorySelect(category)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-[#344b75] border-[#344b75] text-white"
                          : "border-gray-400 group-hover:border-[#344b75] bg-white"
                      }`}
                    >
                      {isChecked && <FaCheck className="text-[10px]" />}
                    </div>
                    <span className="font-medium">{category}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ================= RIGHT AREA: SEARCH & PRODUCTS GRID ================= */}
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6">
          {/* Search Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 p-4 rounded-2xl border border-[#344b75]/20 shadow-sm backdrop-blur-sm">
            {/* Search Box */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search products by name, brand, spec..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-[#1e293b] placeholder-gray-400 text-sm rounded-xl pl-10 pr-8 py-2.5 border border-gray-300 focus:border-[#344b75] outline-none shadow-inner transition-colors"
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results counter */}
            <div className="text-sm text-gray-600 font-medium self-end sm:self-center">
              Showing{" "}
              <span className="text-[#344b75] font-bold">{filteredProducts.length}</span>{" "}
              products
            </div>
          </div>

          {/* Error / Loading Skeleton / Empty State */}
          {error && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-red-50/80 rounded-3xl border-2 border-red-200 text-red-900 shadow-sm p-6">
              <FaExclamationTriangle className="text-4xl text-red-500" />
              <h3 className="text-xl font-bold">Unable to Load Products</h3>
              <p className="text-sm text-red-700 max-w-md">{error}</p>
              <button
                type="button"
                onClick={() => fetchProducts(true)}
                className="mt-2 px-6 py-2.5 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl text-sm font-semibold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FaRedo className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl h-80 border border-gray-200 animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/70 rounded-3xl border-2 border-dashed border-[#344b75]/30 shadow-sm">
              <div className="text-5xl">🔍</div>
              <h3 className="text-xl font-bold text-gray-800">
                No matching hardware products found
              </h3>
              <p className="text-sm text-gray-600 max-w-md">
                Try selecting different category or price filters, or clearing your
                search keywords.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-6 py-2.5 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Grid (4 columns on desktop matching Pic-1) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const productId = product.pId ?? product.pid;
                const productName = product.pName ?? product.pname ?? product.name;
                const stock = product.stockQuantity ?? product.stock_quantity ?? 0;
                return (
                  <motion.div
                    key={productId}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white border-2 border-transparent hover:border-[#344b75]/50 rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 group"
                  >
                    {/* Upper Half: Image with "In Stock" Pill at bottom */}
                    <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-gray-100 flex items-center justify-center p-2">
                      <img
                        src={getProductImageUrl(product.imageUrl)}
                        alt={productName}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* In Stock Badge inside Image at Bottom (Matching Pic-1) */}
                      <div className="absolute bottom-3 left-3 bg-[#344b75] text-white px-2.5 py-0.5 rounded-md text-[11px] font-medium shadow-md">
                        In Stock: {stock}
                      </div>
                    </div>

                    {/* Lower Half: Product Info (Name, Description, Pricing) */}
                    <div className="p-4 flex flex-col gap-2">
                      {/* Product Name */}
                      <h3 className="text-lg font-bold text-[#1e293b] tracking-wide truncate group-hover:text-[#344b75] transition-colors">
                        {productName}
                      </h3>

                      {/* Product Description */}
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Product Pricing */}
                      <div className="pt-2 text-xl font-extrabold text-[#344b75] flex items-baseline gap-1">
                        <span>₹</span>
                        <span>
                          {Number(product.price).toLocaleString("en-IN", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Expanded Product Detail Modal (Pic-2) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Products;
