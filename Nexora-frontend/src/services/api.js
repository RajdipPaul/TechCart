import axios from "axios";
import { mockAuthService, MOCK_PRODUCTS } from "../mock/mockData";

// 1. Backend Base URL Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Toggle Mock Mode: Defaults to true for local testing, set VITE_USE_MOCK="false" for live backend
export const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK !== "false";

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
  return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// 6. User & Authentication API Endpoints (With Mock Fallback)
export const authAPI = {
  register: async (userData) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.register(userData);
    }
    try {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (err) {
      if (!err.response) {
        console.warn("Backend server unreachable. Using mock registration.");
        return mockAuthService.register(userData);
      }
      throw err;
    }
  },

  login: async (credentials) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.login(credentials);
    }
    try {
      const response = await api.post("/api/auth/login", credentials);
      return response.data;
    } catch (err) {
      if (!err.response) {
        console.warn("Backend server unreachable. Using mock login.");
        return mockAuthService.login(credentials);
      }
      throw err;
    }
  },
};

export const userAPI = {
  getProfile: async () => {
    if (USE_MOCK_DATA) {
      return mockAuthService.getProfile();
    }
    try {
      const response = await api.get("/api/users/me");
      return response.data;
    } catch (err) {
      if (!err.response) {
        return mockAuthService.getProfile();
      }
      throw err;
    }
  },

  updateProfile: async (data) => {
    if (USE_MOCK_DATA) {
      return mockAuthService.updateProfile(data);
    }
    try {
      const response = await api.put("/api/users/me", data);
      return response.data;
    } catch (err) {
      if (!err.response) {
        return mockAuthService.updateProfile(data);
      }
      throw err;
    }
  },

  deleteAccount: async () => {
    if (USE_MOCK_DATA) {
      return mockAuthService.deleteAccount();
    }
    try {
      const response = await api.delete("/api/users/me");
      return response.data;
    } catch (err) {
      if (!err.response) {
        return mockAuthService.deleteAccount();
      }
      throw err;
    }
  },
};

// 7. Product Catalog API Endpoints (With Mock Support)
export const productAPI = {
  getAll: async () => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 250));
      return MOCK_PRODUCTS.filter((p) => p.isActive);
    }
    try {
      const response = await api.get("/api/products");
      return response.data;
    } catch (err) {
      if (!err.response) {
        return MOCK_PRODUCTS.filter((p) => p.isActive);
      }
      throw err;
    }
  },

  getById: async (pId) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 150));
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
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_PRODUCTS.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase() && p.isActive
      );
    }
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },

  search: async (keyword) => {
    if (USE_MOCK_DATA) {
      await new Promise((res) => setTimeout(res, 200));
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
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_PRODUCTS.filter(
        (p) => p.brand.toLowerCase() === brand.toLowerCase() && p.isActive
      );
    }
    const response = await api.get(`/api/products/brand/${brand}`);
    return response.data;
  },
};

// 8. Conversations & Messaging API Endpoints (AI Assistant / Shopkeeper)
export const conversationAPI = {
  create: async (title = "New Consultation") => {
    const response = await api.post("/api/conversations", { title });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/api/conversations");
    return response.data;
  },
  getById: async (converId) => {
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
    const response = await api.get(`/api/conversations/${converId}/messages`);
    return response.data;
  },
  sendMessage: async (converId, message) => {
    const response = await api.post(`/api/conversations/${converId}/messages`, {
      message,
    });
    return response.data;
  },
};

// 9. Shopping Cart API Endpoints
export const cartAPI = {
  getCart: async () => {
    const response = await api.get("/api/cart");
    return response.data;
  },
  addItem: async (pId, quantity = 1) => {
    const response = await api.post("/api/cart/items", { pId, quantity });
    return response.data;
  },
  updateItemQuantity: async (cItemsId, quantity) => {
    const response = await api.put(`/api/cart/items/${cItemsId}`, { quantity });
    return response.data;
  },
  removeItem: async (cItemsId) => {
    const response = await api.delete(`/api/cart/items/${cItemsId}`);
    return response.data;
  },
  clearCart: async () => {
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
};

export default api;
