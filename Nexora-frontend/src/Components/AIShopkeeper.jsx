import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import Navbar from "./Navbar";
import ProductDetailModal from "./ProductDetailModal";
import { conversationAPI, productAPI } from "../services/api";

const QUICK_PROMPTS = [
  "Gaming laptop with RTX graphics under ₹80,000",
  "Lightweight laptop for coding with 16GB RAM",
  "Best 5G smartphone under ₹25,000",
  "Affordable student tablet for notes & drawing",
];

const AIShopkeeper = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeConverId, setActiveConverId] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasInitializedPrompt = useRef(false);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load products catalog map for resolving recommended product IDs
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await productAPI.getAll();
        const map = {};
        allProducts.forEach((p) => {
          map[p.pId] = p;
        });
        setProductsMap(map);
      } catch (err) {
        console.error("Failed to load products for AI chat:", err);
      }
    };
    loadProducts();
  }, []);

  // Internal send message logic
  const sendMessageInternal = useCallback(async (converId, text, baseMessages) => {
    if (!text.trim()) return;

    const tempUserMsg = {
      msgId: Date.now(),
      converId,
      role: "USER",
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...(baseMessages || prev), tempUserMsg]);
    setIsSending(true);

    try {
      const aiReply = await conversationAPI.sendMessage(converId, text);
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  }, []);

  // Initialize or fetch the singular conversation and messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const conversations = await conversationAPI.getAll();
        const mainConver = conversations[0] || (await conversationAPI.create("AI Hardware Consultation"));
        setActiveConverId(mainConver.converId);

        const loadedMessages = await conversationAPI.getMessages(mainConver.converId);
        setMessages(loadedMessages);

        // Check if navigated from Hero section with initial prompt
        if (location.state?.initialPrompt && !hasInitializedPrompt.current) {
          hasInitializedPrompt.current = true;
          const initialText = location.state.initialPrompt;
          window.history.replaceState({}, document.title);
          sendMessageInternal(mainConver.converId, initialText, loadedMessages);
        }
      } catch (err) {
        console.error("Failed to initialize conversation:", err);
      }
    };

    initializeChat();
  }, [location.state, sendMessageInternal]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const query = inputValue.trim();
    setInputValue("");
    await sendMessageInternal(activeConverId, query);
  };

  const handleQuickPromptClick = async (prompt) => {
    if (isSending) return;
    await sendMessageInternal(activeConverId, prompt);
  };

  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Chat Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between gap-4">
        {/* Messages Feed Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.msgId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`w-full flex ${
                  msg.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                {/* User Message Bubble */}
                {msg.role === "USER" ? (
                  <div className="max-w-[85%] sm:max-w-md bg-[#344b75] text-white rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-md text-base leading-relaxed break-words">
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <span className="block text-[10px] text-gray-300 text-right mt-1.5 opacity-80">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ) : (
                  /* AI Message Bubble with Avatar & Suggested Products */
                  <div className="max-w-[95%] sm:max-w-2xl flex items-start gap-3">
                    {/* AI Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#344b75] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md border-2 border-white select-none">
                      AI
                    </div>

                    {/* AI Content Box */}
                    <div className="bg-white/90 backdrop-blur-md border-2 border-[#344b75]/20 rounded-3xl rounded-tl-sm p-5 shadow-md flex flex-col gap-4 text-[#1e293b]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#344b75] uppercase tracking-wider">
                        <HiOutlineSparkles className="text-sm" />
                        <span>AI Shopkeeper</span>
                      </div>

                      <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Recommended Product Cards inside AI Response */}
                      {msg.recommendedProductIds &&
                        msg.recommendedProductIds.length > 0 && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {msg.recommendedProductIds.map((pId) => {
                              const product = productsMap[pId];
                              if (!product) return null;

                              return (
                                <motion.div
                                  key={product.pId}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedProduct(product)}
                                  className="flex-1 bg-slate-50 border border-gray-200 hover:border-[#344b75] rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                                >
                                  {/* Thumbnail & In Stock */}
                                  <div className="relative w-full aspect-[16/10] bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                    <img
                                      src={product.imageUrl}
                                      alt={product.pName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute bottom-1.5 left-1.5 bg-[#344b75] text-white text-[10px] px-2 py-0.5 rounded font-medium shadow-sm">
                                      In Stock: {product.stockQuantity}
                                    </span>
                                  </div>

                                  {/* Info */}
                                  <div>
                                    <span className="text-[10px] font-bold text-[#344b75] uppercase tracking-wider">
                                      {product.brand}
                                    </span>
                                    <h4 className="text-sm font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#344b75] transition-colors">
                                      {product.pName}
                                    </h4>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {product.processor || product.graphics || product.category}
                                    </div>
                                  </div>

                                  {/* Price & Action */}
                                  <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                                    <span className="text-base font-extrabold text-[#344b75]">
                                      ₹{Number(product.price).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-xs text-[#344b75] font-semibold underline group-hover:text-[#2563eb]">
                                      View Details
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                      <span className="text-[10px] text-gray-400 self-end mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI Thinking Animation Bubble */}
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#344b75] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md select-none">
                AI
              </div>
              <div className="bg-white/90 border-2 border-[#344b75]/20 rounded-3xl rounded-tl-sm px-5 py-4 shadow-md flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  AI Shopkeeper is matching specs
                </span>
                <span className="inline-flex gap-1 items-center ml-1">
                  <span className="w-1.5 h-1.5 bg-[#344b75] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#344b75] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#344b75] rounded-full animate-bounce"></span>
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Area: Quick Prompts & User Query Input Bar */}
        <div className="w-full flex flex-col gap-3 pt-2">
          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 text-xs">
            <span className="text-gray-500 font-semibold shrink-0">Try asking:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPromptClick(prompt)}
                disabled={isSending}
                className="px-3 py-1.5 bg-white/80 hover:bg-white text-gray-700 hover:text-[#344b75] border border-gray-300 hover:border-[#344b75] rounded-full font-medium whitespace-nowrap transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box with Circular Send Button (Matching Drawing) */}
          <form onSubmit={handleFormSubmit} className="w-full relative">
            <div className="relative flex items-center bg-white rounded-2xl border-2 border-[#344b75]/40 focus-within:border-[#344b75] px-4 py-3 shadow-lg transition-colors">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask our AI Shopkeeper (e.g. 'Laptop for gaming under 80k')..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSending}
                className="w-full bg-transparent text-[#1e293b] text-base font-medium outline-none pr-12 placeholder-gray-400"
                aria-label="User query input"
              />

              {/* Circled Send Arrow Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                aria-label="Send query"
                className="w-10 h-10 rounded-full bg-[#344b75] hover:bg-[#293b5d] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <FaArrowRight className="text-base" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Expanded Product Detail Modal (Same Preview Window from Products Page) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default AIShopkeeper;
