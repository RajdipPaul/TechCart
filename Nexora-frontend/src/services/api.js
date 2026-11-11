import axios from "axios";

// 1. Backend Base URL Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 2. Axios Client Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
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

      // Notify window only if not already navigating to auth
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

// 6. User & Authentication API Endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/api/users/me");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/api/users/me", data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete("/api/users/me");
    return response.data;
  },
};

// 7. Product Catalog API Endpoints
export const productAPI = {
  getAll: async () => {
    const response = await api.get("/api/products");
    return response.data;
  },
  getById: async (pId) => {
    const response = await api.get(`/api/products/${pId}`);
    return response.data;
  },
  getByCategory: async (category) => {
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },
  search: async (keyword) => {
    const response = await api.get(`/api/products/search`, {
      params: { keyword },
    });
    return response.data;
  },
  getByBrand: async (brand) => {
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
