import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdContentCopy,
  MdCheck,
  MdSend,
  MdOutlineSupportAgent,
  MdOutlineAccessTime,
  MdDirections,
  MdOutlineHelpOutline,
  MdOutlineChat,
  MdReceiptLong,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";

const COMPANY_INFO = {
  name: "TechCart Solutions Pvt. Ltd.",
  email: "support@techcart.com",
  secondaryEmail: "contact@techcart.com",
  phone: "+91 (800) 456-7890",
  secondaryPhone: "+91 98765 43210",
  address: "Level 4, Block B, Prestige Cyber Towers",
  landmark: "Outer Ring Road, Bellandur",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560103",
  country: "India",
  workingHours: "Monday – Saturday: 9:00 AM – 8:00 PM IST",
  sundayHours: "Sunday: Closed (AI Shopkeeper available 24/7)",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Prestige+Cyber+Towers+Bengaluru",
};

const CURRENT_YEAR = new Date().getFullYear();

const FAQ_ITEMS = [
  {
    q: "How does the AI Shopkeeper recommend products?",
    a: "Our AI Shopkeeper uses advanced reasoning and live catalog matching to compare processor specs, RAM, displays, and GPU capabilities against your exact budget and personal workflow requirements.",
    link: "/ai-shopkeeper",
    linkText: "Try AI Shopkeeper",
  },
  {
    q: "How do I check the delivery status of my order?",
    a: "You can track and view all your confirmed and pending orders anytime by clicking your profile name in the top navigation bar and selecting 'My Orders'.",
    link: "/orders",
    linkText: "View My Orders",
  },
  {
    q: "What payment methods are supported on TechCart?",
    a: "We support seamless global checkout through PayPal Sandbox. You can complete payments with PayPal balance, linked cards, or credit lines safely with buyer protection.",
    link: "/products",
    linkText: "Browse Products",
  },
];

const ContactUs = () => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Copy helper with feedback
  const handleCopy = (text, key, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(key);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2500);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Your message has been sent successfully! We'll reply within 2 hours.");
    }, 1000);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      subject: "General Inquiry",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] text-[#1e293b] font-outfit flex flex-col justify-between">
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* ================= Header Banner ================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#344b75]/10 text-[#344b75] font-semibold text-xs sm:text-sm tracking-wide mb-4"
          >
            <MdOutlineSupportAgent className="text-lg text-[#344b75]" />
            <span>24/7 Customer Care & Inquiries</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1e293b] tracking-tight leading-tight"
          >
            Get in Touch with{" "}
            <span className="text-[#344b75] underline decoration-wavy decoration-[#344b75]/30">
              TechCart
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed"
          >
            Have a question regarding hardware specifications, an active order, or
            seeking partnership opportunities? Reach out to our dedicated team
            through any of the channels below.
          </motion.p>
        </div>

        {/* ================= 3 Core Highlights: Email, Phone, Address ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {/* Card 1: Company Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-[#344b75]/20 hover:border-[#344b75] rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#344b75] text-white flex items-center justify-center text-3xl shadow-md mb-5">
                <MdEmail />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Email Support
              </span>
              <h2 className="text-xl font-bold text-[#1e293b] mt-1 mb-2">
                Company Email
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Direct inquiry inbox with a guaranteed response time of under 2 hours during business hours.
              </p>

              <div className="bg-[#F0EAD6]/40 border border-gray-200 rounded-2xl p-3.5 mb-2 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[11px] font-semibold uppercase text-gray-500 block">
                    Primary Inbox
                  </span>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-sm sm:text-base font-bold text-[#344b75] hover:underline truncate block"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(COMPANY_INFO.email, "email", "Company Email")}
                  title="Copy email address"
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === "email" ? (
                    <MdCheck className="text-emerald-600 text-lg" />
                  ) : (
                    <MdContentCopy className="text-gray-600 text-lg" />
                  )}
                </button>
              </div>

              <div className="bg-[#F0EAD6]/40 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[11px] font-semibold uppercase text-gray-500 block">
                    General Inquiries
                  </span>
                  <a
                    href={`mailto:${COMPANY_INFO.secondaryEmail}`}
                    className="text-sm sm:text-base font-bold text-[#344b75] hover:underline truncate block"
                  >
                    {COMPANY_INFO.secondaryEmail}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(COMPANY_INFO.secondaryEmail, "secondaryEmail", "General Email")
                  }
                  title="Copy email address"
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === "secondaryEmail" ? (
                    <MdCheck className="text-emerald-600 text-lg" />
                  ) : (
                    <MdContentCopy className="text-gray-600 text-lg" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="w-full py-3 bg-[#344b75] hover:bg-[#293b5d] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <MdSend className="text-base" />
                <span>Write an Email</span>
              </a>
            </div>
          </motion.div>

          {/* Card 2: Company Contact Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-[#344b75]/20 hover:border-[#344b75] rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#344b75] text-white flex items-center justify-center text-3xl shadow-md mb-5">
                <MdPhone />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Phone & Hotline
              </span>
              <h2 className="text-xl font-bold text-[#1e293b] mt-1 mb-2">
                Company Contact
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Connect directly with our customer support executives for instant order & checkout assistance.
              </p>

              <div className="bg-[#F0EAD6]/40 border border-gray-200 rounded-2xl p-3.5 mb-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 block">
                    Toll-Free Support
                  </span>
                  <a
                    href={`tel:${COMPANY_INFO.phone.replace(/[^+\d]/g, "")}`}
                    className="text-base font-bold text-[#344b75] hover:underline"
                  >
                    {COMPANY_INFO.phone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(COMPANY_INFO.phone, "phone", "Toll-Free Number")}
                  title="Copy phone number"
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === "phone" ? (
                    <MdCheck className="text-emerald-600 text-lg" />
                  ) : (
                    <MdContentCopy className="text-gray-600 text-lg" />
                  )}
                </button>
              </div>

              <div className="bg-[#F0EAD6]/40 border border-gray-200 rounded-2xl p-3.5 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 block">
                    Direct Operations
                  </span>
                  <a
                    href={`tel:${COMPANY_INFO.secondaryPhone.replace(/[^+\d]/g, "")}`}
                    className="text-base font-bold text-[#344b75] hover:underline"
                  >
                    {COMPANY_INFO.secondaryPhone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(COMPANY_INFO.secondaryPhone, "secondaryPhone", "Direct Phone")
                  }
                  title="Copy phone number"
                  className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === "secondaryPhone" ? (
                    <MdCheck className="text-emerald-600 text-lg" />
                  ) : (
                    <MdContentCopy className="text-gray-600 text-lg" />
                  )}
                </button>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-2 text-xs text-gray-500 pt-1">
                <MdOutlineAccessTime className="text-base text-[#344b75] shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.workingHours}</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <a
                href={`tel:${COMPANY_INFO.phone.replace(/[^+\d]/g, "")}`}
                className="w-full py-3 bg-[#344b75] hover:bg-[#293b5d] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <MdPhone className="text-base" />
                <span>Call Us Now</span>
              </a>
            </div>
          </motion.div>

          {/* Card 3: Company Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-[#344b75]/20 hover:border-[#344b75] rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#344b75] text-white flex items-center justify-center text-3xl shadow-md mb-5">
                <MdLocationOn />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Corporate Headquarters
              </span>
              <h2 className="text-xl font-bold text-[#1e293b] mt-1 mb-2">
                Company Address
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Our main office for hardware testing labs, administrative operations, and executive leadership.
              </p>

              <div className="bg-[#F0EAD6]/40 border border-gray-200 rounded-2xl p-4 mb-3">
                <p className="font-extrabold text-[#1e293b] text-sm">
                  {COMPANY_INFO.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-snug">
                  {COMPANY_INFO.address},
                </p>
                <p className="text-xs sm:text-sm text-gray-700 leading-snug">
                  {COMPANY_INFO.landmark},
                </p>
                <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-1">
                  {COMPANY_INFO.city}, {COMPANY_INFO.state} – {COMPANY_INFO.postalCode}
                </p>
                <p className="text-xs font-bold text-[#344b75] uppercase tracking-wide mt-0.5">
                  {COMPANY_INFO.country}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Near Intel & EcoSpace Tech Campus</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${COMPANY_INFO.name}, ${COMPANY_INFO.address}, ${COMPANY_INFO.landmark}, ${COMPANY_INFO.city}, ${COMPANY_INFO.state} - ${COMPANY_INFO.postalCode}, ${COMPANY_INFO.country}`,
                      "address",
                      "Company Address"
                    )
                  }
                  className="text-xs font-semibold text-[#344b75] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "address" ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <MdCheck /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <MdContentCopy /> Copy Address
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <a
                href={COMPANY_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#344b75] hover:bg-[#293b5d] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <MdDirections className="text-base" />
                <span>Get Directions (Google Maps)</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* ================= Interactive Contact Form & Live Support Map ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white border-2 border-[#344b75]/20 rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#344b75]">
                Send a Message
              </span>
              <h2
                id="contact-form-heading"
                className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] mt-1"
              >
                We&apos;d Love to Hear From You
              </h2>
              <p className="text-sm text-gray-600 mt-1.5">
                Fill out the form below and an engineer or support specialist will follow up shortly.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg">
                  <MdCheck />
                </div>
                <h3 className="text-2xl font-extrabold text-emerald-900">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md leading-relaxed">
                  Thank you for reaching out, <span className="font-bold">{formData.fullName}</span>.
                  A confirmation has been queued for <span className="font-mono font-bold">{formData.email}</span>,
                  and our team will get in touch with you within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form
                aria-labelledby="contact-form-heading"
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                noValidate={false}
              >
                {/* Row: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      Your Name <span aria-hidden="true" className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="name"
                      required
                      className="w-full px-4 py-3 bg-[#F0EAD6]/30 border-2 border-gray-300 focus:border-[#344b75] focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-email"
                      className="text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      Email Address <span aria-hidden="true" className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. rahul@example.com"
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      required
                      className="w-full px-4 py-3 bg-[#F0EAD6]/30 border-2 border-gray-300 focus:border-[#344b75] focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Row: Phone and Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-phone"
                      className="text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      Contact Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 00000"
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full px-4 py-3 bg-[#F0EAD6]/30 border-2 border-gray-300 focus:border-[#344b75] focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact-subject"
                      className="text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      Inquiry Topic
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#F0EAD6]/30 border-2 border-gray-300 focus:border-[#344b75] focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Shipping Support">Order & Shipping Support</option>
                      <option value="AI Shopkeeper Feedback">AI Shopkeeper Feedback</option>
                      <option value="Product Hardware Advice">Product Hardware Advice</option>
                      <option value="Business & Partnerships">Business & Partnerships</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-bold uppercase tracking-wider text-gray-700"
                  >
                    Your Message <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what you need assistance with, order IDs, or specific laptop hardware models..."
                    required
                    className="w-full px-4 py-3 bg-[#F0EAD6]/30 border-2 border-gray-300 focus:border-[#344b75] focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 resize-y"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#344b75] hover:bg-[#293b5d] disabled:opacity-60 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <MdSend className="text-lg" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick FAQ / Instant Support Side Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Quick Actions Card */}
            <div className="bg-[#344b75] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Self-Service Shortcuts
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Looking for Instant Answers?
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Skip the wait! You can get real-time recommendations from our AI Shopkeeper or track pending orders right now.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/ai-shopkeeper"
                  className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center justify-between text-white transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MdOutlineChat className="text-2xl text-blue-300 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Ask AI Shopkeeper</p>
                      <p className="text-xs text-gray-300">Live hardware comparisons & budget picks</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>

                <Link
                  to="/orders"
                  className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center justify-between text-white transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MdReceiptLong className="text-2xl text-emerald-300 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Track Your Orders</p>
                      <p className="text-xs text-gray-300">View status, PayPal details & receipts</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>

            {/* Common FAQ Accordion-like cards */}
            <div className="bg-white/80 border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#344b75] font-bold text-sm uppercase tracking-wider">
                <MdOutlineHelpOutline className="text-lg" />
                <span>Frequently Asked Questions</span>
              </div>

              <div className="divide-y divide-gray-100 flex flex-col">
                {FAQ_ITEMS.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                    <h4 className="text-sm font-extrabold text-[#1e293b] mb-1">
                      {item.q}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {item.a}
                    </p>
                    <Link
                      to={item.link}
                      className="text-xs font-bold text-[#344b75] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{item.linkText}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= Modern Footer ================= */}
      <footer className="w-full bg-[#1e293b] text-gray-300 py-10 px-6 sm:px-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <Link to="/" className="text-2xl font-extrabold tracking-wide text-white">
              <span className="text-blue-400">Tech</span>Cart
            </Link>
            <span className="hidden sm:inline text-gray-600">|</span>
            <p className="text-xs text-gray-400">
              © {CURRENT_YEAR} {COMPANY_INFO.name}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/products" className="hover:text-white transition-colors">
              Products
            </Link>
            <Link to="/ai-shopkeeper" className="hover:text-white transition-colors">
              AI Shopkeeper
            </Link>
            <Link to="/orders" className="hover:text-white transition-colors">
              My Orders
            </Link>
            <Link to="/contact" className="text-blue-400 font-semibold hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
