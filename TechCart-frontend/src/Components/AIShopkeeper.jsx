import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import ProductDetailModal from "./ProductDetailModal";
import useAuth from "../context/useAuth";
import {
  conversationAPI,
  productAPI,
  aiAPI,
  getProductImageUrl,
  getApiErrorMessage,
} from "../services/api";

const QUICK_PROMPTS = [
  "Gaming laptop with RTX graphics under ₹80,000",
  "Lightweight laptop for coding with 16GB RAM",
  "Best 5G smartphone under ₹25,000",
  "Affordable student tablet for notes & drawing",
];

// Helper to parse numeric budget from natural language query
const parseBudget = (query) => {
  if (!query) return null;
  const clean = query.replace(/,/g, "");

  // Match patterns like "under 25000", "below 30k", "under rs 25000", "budget 40000"
  const budgetMatch =
    clean.match(
      /(?:under|below|less than|within|budget(?: of)?|max|around|up to|₹|rs\.?|inr|rupees)\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?/i
    ) ||
    clean.match(
      /(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?\s*(?:rs|inr|rupees)/i
    );

  if (budgetMatch) {
    let amount = parseFloat(budgetMatch[1]);
    const multiplier = (budgetMatch[2] || "").toLowerCase();
    if (multiplier === "k" || multiplier === "thousand") {
      amount *= 1000;
    } else if (multiplier === "lakh") {
      amount *= 100000;
    }
    return amount;
  }

  // Standalone 4 to 6 digit numbers (e.g. 25000, 80000)
  const numMatch = clean.match(/\b(\d{4,6})\b/);
  if (numMatch) return parseInt(numMatch[1], 10);

  // Standalone shorthand like 25k, 50k
  const kMatch = clean.match(/\b(\d{1,3})k\b/i);
  if (kMatch) return parseInt(kMatch[1], 10) * 1000;

  return null;
};

// Helper to extract product IDs from AI response text
const extractProductIdsFromText = (text, products) => {
  if (!text || !products || products.length === 0) return [];
  const lower = text.toLowerCase();
  const matched = [];

  // 1. Explicit ID citations e.g. [Product ID: 10] or Product ID 10
  const idMatches = text.matchAll(/(?:\[Product ID:\s*|Product ID:\s*|pId:\s*)(\d+)\]?/gi);
  for (const m of idMatches) {
    const id = parseInt(m[1], 10);
    if (products.some((p) => (p.pId ?? p.pid) === id) && !matched.includes(id)) {
      matched.push(id);
    }
  }

  // 2. Exact product name or distinct model substring matching
  for (const p of products) {
    const pId = p.pId ?? p.pid;
    if (!pId || matched.includes(pId)) continue;
    const name = (p.pName || "").toLowerCase();

    // Direct full name match
    if (name && lower.includes(name)) {
      matched.push(pId);
      continue;
    }

    // Match distinctive model name (e.g. "tab s9 fe", "tab m11", "s24 ultra")
    const brand = (p.brand || "").toLowerCase();
    const modelOnly = brand ? name.replace(new RegExp(`^${brand}\\s*`, "i"), "").trim() : "";
    if (modelOnly.length >= 6 && lower.includes(modelOnly)) {
      matched.push(pId);
    }
  }

  return matched.slice(0, 3);
};

// Intelligent hardware advisor based on live MySQL catalog
const generateSmartAiReply = (query, products) => {
  const q = query.toLowerCase();
  let matched = [];
  let categoryLabel = "devices";

  if (q.includes("laptop")) {
    matched = products.filter((p) => (p.category || "").toLowerCase() === "laptops");
    categoryLabel = "laptops";
  } else if (
    q.includes("phone") ||
    q.includes("mobile") ||
    q.includes("smartphone")
  ) {
    matched = products.filter((p) => (p.category || "").toLowerCase() === "smartphones");
    categoryLabel = "smartphones";
  } else if (
    q.includes("tablet") ||
    q.includes("ipad") ||
    q.includes("tab")
  ) {
    matched = products.filter((p) => (p.category || "").toLowerCase() === "tablets");
    categoryLabel = "tablets";
  } else if (
    q.includes("pc") ||
    q.includes("desktop") ||
    q.includes("rig")
  ) {
    matched = products.filter((p) => (p.category || "").toLowerCase() === "pc");
    categoryLabel = "PCs";
  } else {
    matched = [...products];
  }

  // Robust numeric budget parsing
  const budget = parseBudget(query);
  let budgetNote = "";

  if (budget !== null) {
    const withinBudget = matched.filter((p) => p.price <= budget);
    if (withinBudget.length > 0) {
      // Sort within budget descending to give the best spec available within the user's budget
      matched = withinBudget.sort((a, b) => b.price - a.price);
    } else {
      // No items under budget: find the lowest priced alternative in that category
      matched.sort((a, b) => a.price - b.price);
      budgetNote = `We currently do not have any ${categoryLabel} in our catalog under ₹${budget.toLocaleString("en-IN")}. However, the most budget-friendly option in our inventory is highlighted below.\n\n`;
    }
  } else {
    // Gaming requirements
    if (q.includes("game") || q.includes("gaming") || q.includes("rtx")) {
      const gaming = matched.filter(
        (p) =>
          (p.graphics && p.graphics.toLowerCase().includes("rtx")) ||
          p.pName.toLowerCase().includes("gaming")
      );
      if (gaming.length > 0) matched = gaming;
    }

    // Coding & multitasking RAM
    if (
      q.includes("code") ||
      q.includes("coding") ||
      q.includes("programming") ||
      q.includes("16gb")
    ) {
      const coding = matched.filter((p) => (p.ramGb || 0) >= 16);
      if (coding.length > 0) matched = coding;
    }
  }

  if (matched.length === 0) {
    matched = products.slice(0, 2);
  }

  const primary = matched[0] || products[0];
  const secondary = matched.length > 1 ? matched[1] : null;
  const recommendedIds = [primary, secondary]
    .filter(Boolean)
    .map((p) => p.pId ?? p.pid);

  let message = budgetNote
    ? `${budgetNote}Based on your inquiry, I recommend the **${primary.pName}** (${primary.brand}).\n\n`
    : `Hello! Based on your requirements and budget, I recommend the **${primary.pName}** (${primary.brand}).\n\n`;

  message += `• **Why it's a great match**: Equipped with ${primary.processor || "a powerful processor"}, ${primary.ramGb}GB RAM, and ${primary.storageGb}GB ${primary.storageType || "SSD"}.\n`;
  message += `• **Price**: ₹${Number(primary.price).toLocaleString("en-IN")} (${primary.stockQuantity} units currently in stock).\n`;

  if (secondary) {
    message += `\nAnother strong option in our catalog is the **${secondary.pName}** at ₹${Number(secondary.price).toLocaleString("en-IN")}, featuring ${secondary.processor || secondary.category}.\n`;
  }

  message += `\nFeel free to explore the interactive product card below to view complete specifications or add it directly to your cart!`;

  return { message, recommendedProductIds: recommendedIds };
};

const AIShopkeeper = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeConverId, setActiveConverId] = useState(null);
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

  // Load products catalog from live backend
  useEffect(() => {
    let ignore = false;
    productAPI
      .getAll()
      .then((allProducts) => {
        if (!ignore) {
          const list = Array.isArray(allProducts) ? allProducts : [];
          setProductsList(list);
          const map = {};
          list.forEach((p) => {
            map[p.pId ?? p.pid] = p;
          });
          setProductsMap(map);
        }
      })
      .catch((err) => {
        console.error("Failed to load products for AI Shopkeeper:", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Internal send message logic connecting to live backend database
  const sendMessageInternal = useCallback(
    async (converId, text, baseMessages) => {
      if (!text.trim() || !converId) return;

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
        // 1. Attempt to call live backend Gemini AI chat endpoint
        try {
          const aiResponse = await aiAPI.chat(converId, text);
          if (aiResponse && aiResponse.assistantMessage) {
            const recIds = extractProductIdsFromText(
              aiResponse.assistantMessage.message,
              productsList
            );
            const aiMsg = {
              ...aiResponse.assistantMessage,
              recommendedProductIds: recIds,
            };
            setMessages((prev) => [...prev, aiMsg]);
            return;
          }
        } catch (aiErr) {
          console.warn("Backend Gemini chat fallback to database messaging:", aiErr.message);
        }

        // 2. Fallback: Save USER message to MySQL database
        await conversationAPI.saveMessage(converId, "USER", text);

        // 3. Generate intelligent hardware advisor recommendation
        const reply = generateSmartAiReply(text, productsList);

        // 4. Save ASSISTANT message to MySQL database
        const savedAssistant = await conversationAPI.saveMessage(
          converId,
          "ASSISTANT",
          reply.message
        );

        const aiMsg = {
          ...savedAssistant,
          recommendedProductIds: reply.recommendedProductIds,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        console.error("Failed to send message:", err);
        toast.error(getApiErrorMessage(err, "Failed to send message to AI Shopkeeper"));
      } finally {
        setIsSending(false);
      }
    },
    [productsList]
  );

  // Initialize or fetch the singular conversation and messages from backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const isMounted = { current: true };
    const initializeChat = async () => {
      try {
        const conversations = await conversationAPI.getAll();
        const convList = Array.isArray(conversations) ? conversations : [];
        let mainConver = convList.find((c) => c.status === "ACTIVE") || convList[0];

        if (!mainConver) {
          mainConver = await conversationAPI.create("AI Hardware Consultation");
        }

        if (!isMounted.current) return;
        setActiveConverId(mainConver.converId);

        const loadedMessages = await conversationAPI.getMessages(mainConver.converId);
        const msgList = Array.isArray(loadedMessages) ? loadedMessages : [];

        // Attach recommendedProductIds to existing assistant messages
        const enrichedMessages = msgList.map((m) => {
          if (m.role === "ASSISTANT" && !m.recommendedProductIds) {
            return {
              ...m,
              recommendedProductIds: extractProductIdsFromText(m.message, productsList),
            };
          }
          return m;
        });

        if (isMounted.current) {
          setMessages(enrichedMessages);
        }

        // Handle prompt passed from Hero section
        if (location.state?.initialPrompt && !hasInitializedPrompt.current) {
          hasInitializedPrompt.current = true;
          const initialText = location.state.initialPrompt;
          window.history.replaceState({}, document.title);
          sendMessageInternal(mainConver.converId, initialText, enrichedMessages);
        }
      } catch (err) {
        console.error("Failed to initialize conversation from backend:", err);
      }
    };

    initializeChat();

    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, location.state, sendMessageInternal, productsList]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending || !activeConverId) return;

    const query = inputValue.trim();
    setInputValue("");
    await sendMessageInternal(activeConverId, query);
  };

  const handleQuickPromptClick = async (prompt) => {
    if (isSending || !activeConverId) return;
    await sendMessageInternal(activeConverId, prompt);
  };

  // If user is not authenticated, show friendly sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border-2 border-[#344b75]/20 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#344b75]/10 text-[#344b75] flex items-center justify-center text-4xl shadow-inner">
              <HiOutlineSparkles />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1e293b]">
              Chat with AI Shopkeeper
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To keep your hardware consultations and recommended configurations synchronized across all your devices, please log in or create an account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/login"
                state={{ from: "/ai-shopkeeper", initialPrompt: location.state?.initialPrompt }}
                className="w-full py-3 bg-[#344b75] hover:bg-[#293b5d] text-white rounded-xl font-semibold shadow-md transition-all text-center cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="w-full py-3 border-2 border-[#344b75] text-[#344b75] hover:bg-[#344b75] hover:text-white rounded-xl font-semibold transition-all text-center cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Chat Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between gap-4">
        {/* Messages Feed Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1">
          {messages.length === 0 && !isSending && (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-[#344b75]/10 text-[#344b75] flex items-center justify-center text-3xl">
                <HiOutlineSparkles />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Welcome to TechCart AI Shopkeeper
              </h3>
              <p className="text-sm max-w-md">
                Ask me anything about our laptops, smartphones, tablets, or PC rigs. I will analyze your requirements and recommend the best options from our catalog.
              </p>
            </div>
          )}

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

                      {/* Recommended Product Cards inside AI Response (Pic-1 in mini preview) */}
                      {msg.recommendedProductIds &&
                        msg.recommendedProductIds.length > 0 && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {msg.recommendedProductIds.map((pId) => {
                              const product = productsMap[pId];
                              if (!product) return null;

                              const prodId = product.pId ?? product.pid;
                              const prodName = product.pName ?? product.pname ?? product.name;
                              const stock = product.stockQuantity ?? product.stock_quantity ?? 0;

                              return (
                                <motion.div
                                  key={prodId}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedProduct(product)}
                                  className="flex-1 bg-slate-50 border border-gray-200 hover:border-[#344b75] rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                                >
                                  {/* Thumbnail & In Stock */}
                                  <div className="relative w-full aspect-[16/10] bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                    <img
                                      src={getProductImageUrl(product.imageUrl)}
                                      alt={prodName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute bottom-1.5 left-1.5 bg-[#344b75] text-white text-[10px] px-2 py-0.5 rounded font-medium shadow-sm">
                                      In Stock: {stock}
                                    </span>
                                  </div>

                                  {/* Info */}
                                  <div>
                                    <span className="text-[10px] font-bold text-[#344b75] uppercase tracking-wider">
                                      {product.brand}
                                    </span>
                                    <h4 className="text-sm font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#344b75] transition-colors">
                                      {prodName}
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
                disabled={isSending || !activeConverId}
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
                disabled={isSending || !activeConverId}
                className="w-full bg-transparent text-[#1e293b] text-base font-medium outline-none pr-12 placeholder-gray-400"
                aria-label="User query input"
              />

              {/* Circled Send Arrow Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending || !activeConverId}
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
