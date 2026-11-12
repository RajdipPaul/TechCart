import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Products from "./Components/Products";
import Cart from "./Components/Cart";
import AIShopkeeper from "./Components/AIShopkeeper";
import PaymentSuccess from "./Components/PaymentSuccess";
import PaymentCancel from "./Components/PaymentCancel";
import MyOrders from "./Components/MyOrders";
import ContactUs from "./Components/ContactUs";

const App = () => {
  return (
    <div className="w-screen min-h-screen bg-[#F0EAD6]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#ffffff",
            fontFamily: "var(--font-outfit), sans-serif",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/ai-shopkeeper" element={<AIShopkeeper />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </div>
  );
};

export default App;
