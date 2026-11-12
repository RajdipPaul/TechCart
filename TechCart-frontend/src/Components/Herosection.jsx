import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";

const AI_SAMPLE_QUESTIONS = [
  "Tell me what you`re looking for ??\nMaybe I can help you...?!",
  "Looking for a high-performance gaming laptop with RTX graphics?",
  "Need a lightweight laptop for programming and college with long battery life?",
  "What is your target budget? I can find you the best value for money!",
  "Comparing ASUS Vivobook vs HP Victus? Ask me to break down the specs!",
];

const Herosection = () => {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Automatically cycle through engaging AI questions every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % AI_SAMPLE_QUESTIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      navigate("/ai-shopkeeper");
      return;
    }

    navigate("/ai-shopkeeper", { state: { initialPrompt: inputValue.trim() } });
  };

  return (
    <section className="min-h-[calc(100vh-96px)] bg-[#F0EAD6] flex items-center justify-center px-6 md:px-12 py-10 font-outfit">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* ================= LEFT SIDE: Hero Text & Action ================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex flex-col items-start text-left gap-6"
        >
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e293b] leading-[1.15] tracking-tight">
            Find the Right Tech. <br />
            <span className="text-[#344b75] underline decoration-wavy decoration-[#344b75]/30">
              Guided by AI.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl font-normal">
            Discover laptops, compare hardware specifications in real-time, and
            get personalized recommendations tailored to your exact budget and
            workflow. Seamlessly pay with PayPal when you find the one.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2">
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
            >
              <Link
                to="/products"
                className="px-8 py-4 bg-transparent border-2 border-[#1e293b] hover:border-[#344b75] text-[#1e293b] hover:text-white hover:bg-[#344b75] text-xl font-semibold rounded-2xl shadow-md transition-all duration-300 flex items-center gap-3 cursor-pointer"
              >
                View Products
                <FaArrowRight className="text-base" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE: Interactive AI Chat Box ================= */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-md bg-white/70 backdrop-blur-md border-2 border-[#344b75]/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between gap-8 min-h-[360px] relative">
            {/* Chat Box Top: AI Message Bubble */}
            <div className="flex items-start gap-4">
              {/* AI Avatar Badge */}
              <div className="w-12 h-12 rounded-full border-2 border-[#344b75] bg-[#344b75] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 select-none">
                AI
              </div>

              {/* Message Bubble */}
              <div className="flex-1 bg-white border-2 border-gray-300 rounded-3xl rounded-tl-sm p-5 shadow-sm min-h-[100px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={questionIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#1e293b] font-medium text-lg leading-relaxed whitespace-pre-line"
                  >
                    {AI_SAMPLE_QUESTIONS[questionIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Chat Box Bottom: Input Box with Blinking Cursor and Send Button */}
            <form
              onSubmit={handleSendPrompt}
              className="w-full relative flex items-center"
            >
              <div className="w-full relative flex items-center border-2 border-gray-400/80 focus-within:border-[#344b75] bg-white rounded-2xl px-4 py-3 shadow-inner transition-colors">
                {/* Simulated Blinking Cursor when empty and not focused, or interactive input */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={isFocused ? "" : ""}
                  className="w-full bg-transparent text-[#1e293b] text-lg font-medium outline-none pr-10"
                  aria-label="Ask the AI Shopkeeper"
                />

                {/* Blinking cursor overlay when input is empty */}
                {inputValue === "" && (
                  <div
                    onClick={() => setIsFocused(true)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none text-gray-500 font-normal text-lg"
                  >
                    <span className="text-gray-400">
                      {isFocused ? "" : "Ask me anything..."}
                    </span>
                    <span className="inline-block w-[2px] h-6 bg-[#344b75] animate-blink-cursor ml-1"></span>
                  </div>
                )}

                {/* Send Button with circled Arrow icon */}
                <button
                  type="submit"
                  aria-label="Send query"
                  className="w-9 h-9 rounded-full border-2 border-[#344b75] bg-[#344b75] hover:bg-[#345696ea] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shrink-0 ml-2"
                >
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Herosection;
