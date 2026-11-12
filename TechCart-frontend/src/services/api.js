import axios from "axios";
import {
  mockAuthService,
  mockCartService,
  mockConversationService,
  MOCK_PRODUCTS,
} from "../mock/mockData";

// 1. Backend Base URL Configuration
// When empty, Axios uses relative paths (/api/...) which Vite proxies to http://localhost:8080 (avoids CORS)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : "";

// Toggle Mock Mode: Defaults to false (live backend connected). Set VITE_USE_MOCK="true" to force mock mode.
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === "true";

// Helper to extract clean error messages from backend responses (Spring validation map, error string, or network)
export const getApiErrorMessage = (
  err,
  defaultMsg = "An unexpected error occurred. Please try again."
) => {
  if (!err) return defaultMsg;
  if (err.code === "ERR_NETWORK") {
    return "Unable to connect to backend server. Please verify backend is running on http://localhost:8080.";
  }
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  if (data?.error && typeof data.error === "string") {
    return data.error;
  }
  if (data?.message && typeof data.message === "string") {
    return data.message;
  }
  if (data && typeof data === "object") {
    const fieldErrors = Object.values(data).filter(
      (v) => typeof v === "string"
    );
    if (fieldErrors.length > 0) {
      return fieldErrors.join(" • ");
    }
  }
  return err.message || defaultMsg;
};

// 2. Axios Client Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 3. Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response Interceptor: Global Error & 401 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Clear invalid/expired session
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

// 5. Image Helper: Resolve relative product image paths
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-product.png";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const base = API_BASE_URL || "";
  return `${base}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// 6. User & Authentication API Endpoints (Live Backend Connected)
export const authAPI = {
  register: async (userData) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.register(userData);
    }
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.login(credentials);
    }
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    if (USE_MOCK_DATA) {
      return mockAuthService.getProfile();
    }
    const response = await api.get("/api/users/me");
    return response.data;
  },

  updateProfile: async (data) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.updateProfile(data);
    }
    const response = await api.put("/api/users/me", data);
    return response.data;
  },

  deleteAccount: async () => {
    if (USE_MOCK_DATA) {
      return mockAuthService.deleteAccount();
    }
    const response = await api.delete("/api/users/me");
    return response.data;
  },
};

// 7. Product Catalog API Endpoints (Live Backend Connected)
export const productAPI = {
  getAll: async () => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_PRODUCTS.filter((p) => p.isActive);
    }
    const response = await api.get("/api/products");
    return response.data;
  },

  getById: async (pId) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 100));
      const found = MOCK_PRODUCTS.find((p) => p.pId === Number(pId));
      if (!found) {
        const error = new Error("Product not found");
        error.response = { status: 404, data: { message: error.message } };
        throw error;
      }
      return found;
    }
    const response = await api.get(`/api/products/${pId}`);
    return response.data;
  },

  getByCategory: async (category) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 100));
      return MOCK_PRODUCTS.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase() && p.isActive
      );
    }
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },

  search: async (keyword) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 150));
      const term = keyword.toLowerCase().trim();
      return MOCK_PRODUCTS.filter(
        (p) =>
          p.isActive &&
          (p.pName.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term))
      );
    }
    const response = await api.get(`/api/products/search`, {
      params: { keyword },
    });
    return response.data;
  },

  getByBrand: async (brand) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 100));
      return MOCK_PRODUCTS.filter(
        (p) => p.brand.toLowerCase() === brand.toLowerCase() && p.isActive
      );
    }
    const response = await api.get(`/api/products/brand/${brand}`);
    return response.data;
  },
};

// 8. Conversations & Messaging API Endpoints (Live Backend Connected)
export const conversationAPI = {
  create: async (title = "AI Hardware Consultation") => {
    if (USE_MOCK_DATA) {
      return mockConversationService.create(title);
    }
    const response = await api.post("/api/conversations", { title });
    return response.data;
  },
  getAll: async () => {
    if (USE_MOCK_DATA) {
      return mockConversationService.getAll();
    }
    const response = await api.get("/api/conversations");
    return response.data;
  },
  getById: async (converId) => {
    if (USE_MOCK_DATA) {
      return mockConversationService.getById(converId);
    }
    const response = await api.get(`/api/conversations/${converId}`);
    return response.data;
  },
  delete: async (converId) => {
    const response = await api.delete(`/api/conversations/${converId}`);
    return response.data;
  },
  close: async (converId) => {
    const response = await api.patch(`/api/conversations/${converId}/close`);
    return response.data;
  },
  getMessages: async (converId) => {
    if (USE_MOCK_DATA) {
      return mockConversationService.getMessages(converId);
    }
    const response = await api.get(`/api/conversations/${converId}/messages`);
    return response.data;
  },
  saveMessage: async (converId, role, message) => {
    if (USE_MOCK_DATA) {
      return mockConversationService.sendMessage(converId, message);
    }
    const response = await api.post(`/api/conversations/${converId}/messages`, {
      role,
      message,
    });
    return response.data;
  },
};

// 8b. AI Shopkeeper Chat API
export const aiAPI = {
  chat: async (converId, message) => {
    const response = await api.post("/api/ai/chat", { converId, message });
    return response.data;
  },
};

// 9. Shopping Cart API Endpoints (Live Backend Connected)
export const cartAPI = {
  getCart: async () => {
    if (USE_MOCK_DATA) {
      return mockCartService.getCart();
    }
    const response = await api.get("/api/cart");
    return response.data;
  },
  addItem: async (pId, quantity = 1) => {
    if (USE_MOCK_DATA) {
      return mockCartService.addItem(pId, quantity);
    }
    const response = await api.post("/api/cart/items", { pId, quantity });
    return response.data;
  },
  updateItemQuantity: async (cItemsId, quantity) => {
    if (USE_MOCK_DATA) {
      return mockCartService.updateItemQuantity(cItemsId, quantity);
    }
    const response = await api.put(`/api/cart/items/${cItemsId}`, { quantity });
    return response.data;
  },
  removeItem: async (cItemsId) => {
    if (USE_MOCK_DATA) {
      return mockCartService.removeItem(cItemsId);
    }
    const response = await api.delete(`/api/cart/items/${cItemsId}`);
    return response.data;
  },
  clearCart: async () => {
    if (USE_MOCK_DATA) {
      return mockCartService.clearCart();
    }
    const response = await api.delete("/api/cart/items");
    return response.data;
  },
};

// 10. Orders & PayPal Checkout API Endpoints
export const orderAPI = {
  createOrder: async (shippingData) => {
    const response = await api.post("/api/orders", shippingData);
    return response.data;
  },
  createPayPalOrder: async (orderId) => {
    const response = await api.post(`/api/orders/${orderId}/paypal/create`);
    return response.data;
  },
  capturePayPalPayment: async (orderId) => {
    const response = await api.post(`/api/orders/${orderId}/paypal/capture`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/api/orders");
    return response.data;
  },
  getById: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/api/orders/${orderId}`);
    return response.data;
  },
};

export default api;
