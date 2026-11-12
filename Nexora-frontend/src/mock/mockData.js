// ==========================================================================
// TechCart / Nexora — Mock Data & Service Store
// Mirrors the backend database entities and API response DTOs 1:1.
// Supports offline development, local testing, and seamless backend integration.
// ==========================================================================

const USERS_STORAGE_KEY = "techcart_mock_users";
const CURRENT_USER_KEY = "user";
const ACCESS_TOKEN_KEY = "accessToken";
const CART_STORAGE_KEY = "techcart_mock_cart";

// 1. Initial Mock Users (Matching backend specification)
const DEFAULT_USERS = [
  {
    userId: 1,
    fullName: "Sima Chakraborty",
    email: "sima@gmail.com",
    phoneNumber: "9876543210",
    password: "Pass@123",
    createdAt: "2026-11-10T10:30:00",
  },
  {
    userId: 2,
    fullName: "Alex Rivera",
    email: "alex@example.com",
    phoneNumber: "9123456789",
    password: "Password@123",
    createdAt: "2026-11-10T11:00:00",
  },
];

// Helper: Get users list from localStorage or initialize with defaults
const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_USERS;
  }
};

// Helper: Save users list to localStorage
const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to persist mock users:", err);
  }
};

// ==========================================================================
// Mock Authentication Service
// ==========================================================================
export const mockAuthService = {
  // POST /api/auth/register
  register: async ({ fullName, email, password, phoneNumber }) => {
    await new Promise((res) => setTimeout(res, 300));

    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      const error = new Error("An account with this email address already exists.");
      error.response = { status: 409, data: { message: error.message } };
      throw error;
    }

    const newUser = {
      userId: users.length > 0 ? Math.max(...users.map((u) => u.userId)) + 1 : 1,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    return {
      userId: newUser.userId,
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      createdAt: newUser.createdAt,
    };
  },

  // POST /api/auth/login
  login: async ({ email, password }) => {
    await new Promise((res) => setTimeout(res, 250));

    const users = getStoredUsers();
    const normalizedEmail = email.toLowerCase().trim();

    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (user) {
      if (user.password !== password && password !== "Pass@123") {
        const error = new Error("Invalid email or password.");
        error.response = { status: 401, data: { message: error.message } };
        throw error;
      }
    } else if (normalizedEmail.includes("@")) {
      user = {
        userId: users.length + 1,
        fullName: email.split("@")[0].replace(".", " "),
        email: normalizedEmail,
        phoneNumber: "9876543210",
        createdAt: new Date().toISOString(),
      };
      users.push({ ...user, password });
      saveStoredUsers(users);
    } else {
      const error = new Error("Invalid credentials. Please check your email.");
      error.response = { status: 401, data: { message: error.message } };
      throw error;
    }

    const token = `mock-jwt-${user.userId}-${Date.now()}`;
    const userProfile = {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    };

    return {
      accessToken: token,
      tokenType: "Bearer",
      user: userProfile,
    };
  },

  // GET /api/users/me
  getProfile: async () => {
    await new Promise((res) => setTimeout(res, 100));

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      const error = new Error("Full authentication is required to access this resource");
      error.response = { status: 401, data: { message: error.message } };
      throw error;
    }

    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    const users = getStoredUsers();
    const defaultUser = users[0] || DEFAULT_USERS[0];
    return {
      userId: defaultUser.userId,
      fullName: defaultUser.fullName,
      email: defaultUser.email,
      phoneNumber: defaultUser.phoneNumber,
      createdAt: defaultUser.createdAt,
    };
  },

  // PUT /api/users/me
  updateProfile: async ({ fullName, phoneNumber }) => {
    await new Promise((res) => setTimeout(res, 150));

    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
      // ignore
    }

    const users = getStoredUsers();
    const targetId = currentUser ? currentUser.userId : 1;
    const userIndex = users.findIndex((u) => u.userId === targetId);

    if (userIndex !== -1) {
      users[userIndex].fullName = fullName || users[userIndex].fullName;
      users[userIndex].phoneNumber = phoneNumber || users[userIndex].phoneNumber;
      users[userIndex].updatedAt = new Date().toISOString();
      saveStoredUsers(users);

      return {
        userId: users[userIndex].userId,
        fullName: users[userIndex].fullName,
        email: users[userIndex].email,
        phoneNumber: users[userIndex].phoneNumber,
        createdAt: users[userIndex].createdAt,
        updatedAt: users[userIndex].updatedAt,
      };
    }

    return {
      userId: targetId,
      fullName,
      phoneNumber,
      email: "sima@gmail.com",
      updatedAt: new Date().toISOString(),
    };
  },

  // DELETE /api/users/me
  deleteAccount: async () => {
    await new Promise((res) => setTimeout(res, 150));
    return { message: "Account deleted successfully" };
  },
};

// ==========================================================================
// Mock Product Catalog (Full spec matching Database Entity)
// Categories: Laptops, Smartphones, Tablets, Pc
// Prices spanning: <20000, 20000-30000, 30000-40000, 40000-50000, >50000
// ==========================================================================
export const MOCK_PRODUCTS = [
  // --- LAPTOPS ---
  {
    pId: 1,
    pName: "ASUS Vivobook 15 OLED",
    brand: "ASUS",
    category: "Laptops",
    description: "Vibrant 15.6-inch FHD OLED display with ultra-fast Intel Core i5 13th Gen, perfect for programming and creative media.",
    price: 55999.0,
    currency: "INR",
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core i5-1335U (10 Cores, up to 4.6 GHz)",
    ramGb: 16,
    storageGb: 512,
    storageType: "NVMe SSD",
    graphics: "Intel Iris Xe Graphics",
    displaySizeInches: 15.6,
    displayReso: "1920x1080 FHD OLED",
    batteryWh: 50,
    weightKg: 1.7,
    connectivity: "Wi-Fi 6E, Bluetooth 5.3, USB-C, HDMI",
    isActive: true,
  },
  {
    pId: 2,
    pName: "HP Victus Gaming 15",
    brand: "HP",
    category: "Laptops",
    description: "High-octane gaming rig equipped with NVIDIA GeForce RTX 3050, 144Hz high-refresh display, and advanced dual-fan cooling.",
    price: 74999.0,
    currency: "INR",
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60",
    processor: "AMD Ryzen 5 7535HS (6 Cores, up to 4.55 GHz)",
    ramGb: 16,
    storageGb: 512,
    storageType: "Gen4 NVMe SSD",
    graphics: "NVIDIA GeForce RTX 3050 (4GB GDDR6)",
    displaySizeInches: 15.6,
    displayReso: "1920x1080 144Hz IPS",
    batteryWh: 70,
    weightKg: 2.29,
    connectivity: "Wi-Fi 6, Bluetooth 5.3, RJ-45 Ethernet, USB-C",
    isActive: true,
  },
  {
    pId: 3,
    pName: "Dell Inspiron 14 Essential",
    brand: "Dell",
    category: "Laptops",
    description: "Compact student and daily home laptop with Intel Core i3 12th Gen, anti-glare display, and fast ExpressCharge battery.",
    price: 36990.0,
    currency: "INR",
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core i3-1215U (6 Cores, up to 4.4 GHz)",
    ramGb: 8,
    storageGb: 512,
    storageType: "M.2 SSD",
    graphics: "Intel UHD Graphics",
    displaySizeInches: 14.0,
    displayReso: "1920x1080 FHD Anti-Glare",
    batteryWh: 41,
    weightKg: 1.48,
    connectivity: "Wi-Fi 6, Bluetooth 5.2, USB-A, HDMI",
    isActive: true,
  },
  {
    pId: 4,
    pName: "Lenovo IdeaPad Slim 3",
    brand: "Lenovo",
    category: "Laptops",
    description: "Budget powerhouse laptop engineered for everyday office workflows, web browsing, and remote learning with military-grade durability.",
    price: 28990.0,
    currency: "INR",
    stockQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Celeron N4020 (Dual Core, 2.8 GHz)",
    ramGb: 8,
    storageGb: 256,
    storageType: "NVMe SSD",
    graphics: "Intel Integrated Graphics",
    displaySizeInches: 15.6,
    displayReso: "1920x1080 FHD",
    batteryWh: 42,
    weightKg: 1.62,
    connectivity: "Wi-Fi 5, Bluetooth 5.0, USB 3.2, Audio Jack",
    isActive: true,
  },

  // --- SMARTPHONES ---
  {
    pId: 5,
    pName: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    description: "Flagship smartphone featuring Galaxy AI, titanium frame, 200MP quad camera system, and integrated S-Pen stylus.",
    price: 129999.0,
    currency: "INR",
    stockQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=60",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    ramGb: 12,
    storageGb: 512,
    storageType: "UFS 4.0",
    graphics: "Adreno 750",
    displaySizeInches: 6.8,
    displayReso: "3120x1440 QHD+ Dynamic AMOLED 2X 120Hz",
    batteryWh: 19.25, // ~5000 mAh
    weightKg: 0.232,
    connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, Ultra-Wideband, NFC",
    isActive: true,
  },
  {
    pId: 6,
    pName: "OnePlus Nord CE 3 Lite 5G",
    brand: "OnePlus",
    category: "Smartphones",
    description: "Vibrant mid-range performer with 108MP camera, 67W SUPERVOOC rapid charging, and smooth 120Hz display.",
    price: 17499.0,
    currency: "INR",
    stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=60",
    processor: "Qualcomm Snapdragon 695 5G",
    ramGb: 8,
    storageGb: 128,
    storageType: "UFS 2.2",
    graphics: "Adreno 619",
    displaySizeInches: 6.72,
    displayReso: "2400x1080 FHD+ 120Hz",
    batteryWh: 19.25, // 5000 mAh
    weightKg: 0.195,
    connectivity: "5G, Dual-band Wi-Fi, Bluetooth 5.1, Type-C",
    isActive: true,
  },
  {
    pId: 7,
    pName: "Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    category: "Smartphones",
    description: "Ultra-clear 200MP OIS camera with 1.5K 120Hz AMOLED curved display, Corning Gorilla Glass Victus, and turbo charging.",
    price: 24999.0,
    currency: "INR",
    stockQuantity: 18,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
    processor: "Snapdragon 7s Gen 2 (4nm)",
    ramGb: 8,
    storageGb: 256,
    storageType: "UFS 2.2",
    graphics: "Adreno 710",
    displaySizeInches: 6.67,
    displayReso: "2712x1220 1.5K AMOLED 120Hz",
    batteryWh: 19.6, // 5100 mAh
    weightKg: 0.187,
    connectivity: "5G, Wi-Fi 5, Bluetooth 5.2, IR Blaster, NFC",
    isActive: true,
  },
  {
    pId: 8,
    pName: "Google Pixel 8a",
    brand: "Google",
    category: "Smartphones",
    description: "Google Tensor G3 chip delivering groundbreaking AI photo editing, 7 years of OS updates, and IP67 water resistance.",
    price: 49999.0,
    currency: "INR",
    stockQuantity: 14,
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=60",
    processor: "Google Tensor G3 with Titan M2 security",
    ramGb: 8,
    storageGb: 128,
    storageType: "UFS 3.1",
    graphics: "Immortalis-G715s MC10",
    displaySizeInches: 6.1,
    displayReso: "2400x1080 Actua OLED 120Hz",
    batteryWh: 17.3, // 4492 mAh
    weightKg: 0.188,
    connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, Google Cast",
    isActive: true,
  },

  // --- TABLETS ---
  {
    pId: 9,
    pName: "Apple iPad 10th Generation",
    brand: "Apple",
    category: "Tablets",
    description: "All-screen 10.9-inch Liquid Retina display with A14 Bionic chip, landscape 12MP front camera with Center Stage, and USB-C.",
    price: 34900.0,
    currency: "INR",
    stockQuantity: 16,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60",
    processor: "Apple A14 Bionic (6-core CPU)",
    ramGb: 4,
    storageGb: 64,
    storageType: "NVMe Flash",
    graphics: "4-core Apple GPU",
    displaySizeInches: 10.9,
    displayReso: "2360x1640 Liquid Retina TrueTone",
    batteryWh: 28.6,
    weightKg: 0.477,
    connectivity: "Wi-Fi 6, Bluetooth 5.2, USB-C, Smart Connector",
    isActive: true,
  },
  {
    pId: 10,
    pName: "Samsung Galaxy Tab A9+",
    brand: "Samsung",
    category: "Tablets",
    description: "Affordable family tablet with quad speakers by Dolby Atmos, 90Hz smooth screen, and Samsung DeX multitasking support.",
    price: 18999.0,
    currency: "INR",
    stockQuantity: 22,
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=60",
    processor: "Qualcomm Snapdragon 695",
    ramGb: 8,
    storageGb: 128,
    storageType: "eMMC 5.1",
    graphics: "Adreno 619",
    displaySizeInches: 11.0,
    displayReso: "1920x1200 WUXGA 90Hz",
    batteryWh: 27.1, // 7040 mAh
    weightKg: 0.48,
    connectivity: "Wi-Fi 5, Bluetooth 5.1, 3.5mm Headphone Jack",
    isActive: true,
  },
  {
    pId: 11,
    pName: "Apple iPad Air M2",
    brand: "Apple",
    category: "Tablets",
    description: "Supercharged by the revolutionary M2 chip with Apple Pencil Pro support, Magic Keyboard capability, and breathtaking color accuracy.",
    price: 59900.0,
    currency: "INR",
    stockQuantity: 11,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60",
    processor: "Apple M2 (8-core CPU)",
    ramGb: 8,
    storageGb: 128,
    storageType: "Unified NVMe SSD",
    graphics: "10-core Apple GPU",
    displaySizeInches: 11.0,
    displayReso: "2360x1640 Liquid Retina P3 Wide Color",
    batteryWh: 28.93,
    weightKg: 0.462,
    connectivity: "Wi-Fi 6E, Bluetooth 5.3, USB-C Thunderbolt",
    isActive: true,
  },

  // --- PC / DESKTOPS ---
  {
    pId: 12,
    pName: "Apple Mac Mini M2",
    brand: "Apple",
    category: "Pc",
    description: "Compact desktop powerhouse designed for high-throughput productivity, video editing, and software engineering.",
    price: 59900.0,
    currency: "INR",
    stockQuantity: 7,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60",
    processor: "Apple M2 (8-core CPU, 10-core GPU)",
    ramGb: 16,
    storageGb: 512,
    storageType: "Unified High-Speed SSD",
    graphics: "Apple 10-core Integrated GPU",
    displaySizeInches: 0.0, // Desktop mini unit
    displayReso: "Supports up to 6K @ 60Hz Pro Display",
    batteryWh: 0,
    weightKg: 1.18,
    connectivity: "2x Thunderbolt 4, 2x USB-A, HDMI, Gigabit Ethernet, Wi-Fi 6E",
    isActive: true,
  },
  {
    pId: 13,
    pName: "HP All-in-One PC 24-cr0000in",
    brand: "HP",
    category: "Pc",
    description: "Space-saving elegant desktop computer with three-sided micro-edge display, pop-up privacy webcam, and wireless mouse & keyboard.",
    price: 48999.0,
    currency: "INR",
    stockQuantity: 9,
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=60",
    processor: "AMD Ryzen 3 7320U (4 Cores, up to 4.1 GHz)",
    ramGb: 8,
    storageGb: 512,
    storageType: "PCIe NVMe M.2 SSD",
    graphics: "AMD Radeon 610M Graphics",
    displaySizeInches: 23.8,
    displayReso: "1920x1080 FHD IPS Anti-Glare",
    batteryWh: 0,
    weightKg: 5.37,
    connectivity: "Wi-Fi 6, Bluetooth 5.3, RJ-45 LAN, HDMI-Out, 4x USB",
    isActive: true,
  },
  {
    pId: 14,
    pName: "ASUS ROG Strix Gaming Desktop",
    brand: "ASUS",
    category: "Pc",
    description: "High-tier gaming battlestation with Aura Sync RGB illumination, flow-tech chassis, Intel Core i7, and NVIDIA RTX 4060 graphics.",
    price: 99990.0,
    currency: "INR",
    stockQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core i7-13700F (16 Cores, up to 5.2 GHz)",
    ramGb: 16,
    storageGb: 1024,
    storageType: "Gen4 M.2 NVMe SSD",
    graphics: "NVIDIA GeForce RTX 4060 (8GB GDDR6)",
    displaySizeInches: 0.0,
    displayReso: "Multi-Monitor 4K Support",
    batteryWh: 0,
    weightKg: 8.0,
    connectivity: "Wi-Fi 6E, Bluetooth 5.3, 2.5G LAN, 8x USB, DP, HDMI 2.1",
    isActive: true,
  },
];

// ==========================================================================
// Mock Shopping Cart Service (Matching CartResponse DTO)
// ==========================================================================
// Helper: Get user-specific cart key to mirror Database `carts.user_id`
const getUserCartStorageKey = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.userId) {
        return `techcart_mock_cart_user_${user.userId}`;
      }
    }
    return CART_STORAGE_KEY;
  } catch {
    return CART_STORAGE_KEY;
  }
};

const getStoredCart = () => {
  const key = getUserCartStorageKey();
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;
      const defaultCart = {
        cartId: user ? user.userId + 100 : 2,
        userId: user ? user.userId : 1,
        status: "ACTIVE",
        currency: "INR",
        items: [],
        totalItems: 0,
        totalAmount: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(defaultCart));
      return defaultCart;
    }
    return JSON.parse(data);
  } catch {
    return {
      cartId: 2,
      status: "ACTIVE",
      currency: "INR",
      items: [],
      totalItems: 0,
      totalAmount: 0.0,
    };
  }
};

const saveStoredCart = (cart) => {
  const key = getUserCartStorageKey();
  try {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(cart));
  } catch (err) {
    console.error("Failed to save cart:", err);
  }
};

export const mockCartService = {
  // GET /api/cart
  getCart: async () => {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredCart();
  },

  // POST /api/cart/items
  addItem: async (pId, quantity = 1) => {
    await new Promise((res) => setTimeout(res, 150));
    const cart = getStoredCart();
    const product = MOCK_PRODUCTS.find((p) => p.pId === Number(pId));

    if (!product) {
      const error = new Error("Product not found");
      error.response = { status: 404, data: { message: error.message } };
      throw error;
    }

    const existingIndex = cart.items.findIndex((item) => item.pId === product.pId);

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].subtotal =
        cart.items[existingIndex].quantity * cart.items[existingIndex].price;
    } else {
      const newItem = {
        cItemsId: Date.now(),
        pId: product.pId,
        pName: product.pName,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        price: product.price,
        currency: product.currency,
        quantity,
        subtotal: product.price * quantity,
      };
      cart.items.push(newItem);
    }

    saveStoredCart(cart);
    return cart;
  },

  // PUT /api/cart/items/{cItemsId}
  updateItemQuantity: async (cItemsId, quantity) => {
    await new Promise((res) => setTimeout(res, 100));
    const cart = getStoredCart();
    const item = cart.items.find((i) => i.cItemsId === Number(cItemsId));

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.cItemsId !== Number(cItemsId));
      } else {
        item.quantity = quantity;
        item.subtotal = item.price * quantity;
      }
      saveStoredCart(cart);
    }

    return cart;
  },

  // DELETE /api/cart/items/{cItemsId}
  removeItem: async (cItemsId) => {
    await new Promise((res) => setTimeout(res, 100));
    const cart = getStoredCart();
    cart.items = cart.items.filter((i) => i.cItemsId !== Number(cItemsId));
    saveStoredCart(cart);
    return cart;
  },

  // DELETE /api/cart/items
  clearCart: async () => {
    await new Promise((res) => setTimeout(res, 100));
    const cart = getStoredCart();
    cart.items = [];
    saveStoredCart(cart);
    return cart;
  },
};

// ==========================================================================
// Mock Conversation & Messages Service (AI Shopkeeper)
// Matches database `conversations` and `messages` tables
// ==========================================================================
const getConversationStorageKey = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.userId) {
        return `techcart_mock_conversations_user_${user.userId}`;
      }
    }
    return "techcart_mock_conversations_user_default";
  } catch {
    return "techcart_mock_conversations_user_default";
  }
};

const getStoredConversations = () => {
  const key = getConversationStorageKey();
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      const defaultConversation = [
        {
          converId: 1,
          title: "AI Shopkeeper Consultation",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(key, JSON.stringify(defaultConversation));
      return defaultConversation;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const getStoredMessages = (converId) => {
  const key = `techcart_mock_messages_conver_${converId}`;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      const initialMessages = [
        {
          msgId: 1,
          converId: Number(converId),
          role: "ASSISTANT",
          message:
            "Hello! I'm your AI Shopkeeper at Nexora. Tell me what you're looking for—whether it's gaming, high-performance programming, or budget productivity—and I'll pick the best device for you!",
          recommendedProductIds: [1, 2],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(key, JSON.stringify(initialMessages));
      return initialMessages;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveStoredMessages = (converId, messages) => {
  const key = `techcart_mock_messages_conver_${converId}`;
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save messages:", err);
  }
};

// AI Response & Product Recommendation Engine
const generateAIResponse = (userPrompt) => {
  const promptLower = userPrompt.toLowerCase();
  let responseText = "";
  let matchedProducts = [];

  // 1. Gaming / High Performance
  if (
    promptLower.includes("game") ||
    promptLower.includes("gaming") ||
    promptLower.includes("rtx") ||
    promptLower.includes("graphics") ||
    promptLower.includes("fps")
  ) {
    matchedProducts = MOCK_PRODUCTS.filter(
      (p) =>
        p.category === "Laptops" &&
        (p.pName.includes("Victus") || p.pName.includes("ROG") || p.graphics.includes("RTX"))
    );
    responseText =
      "For gaming and intense graphical workflows, you need dedicated RTX GPU power, high refresh rates (144Hz+), and robust dual-fan cooling. Here are top recommendations that crush modern AAA titles within great value:";
  }
  // 2. Programming / Coding / College / Work
  else if (
    promptLower.includes("code") ||
    promptLower.includes("coding") ||
    promptLower.includes("developer") ||
    promptLower.includes("student") ||
    promptLower.includes("college") ||
    promptLower.includes("work") ||
    promptLower.includes("office")
  ) {
    matchedProducts = MOCK_PRODUCTS.filter(
      (p) =>
        (p.category === "Laptops" && (p.pName.includes("Vivobook") || p.pName.includes("MacBook"))) ||
        (p.category === "Tablets" && p.pName.includes("iPad"))
    );
    responseText =
      "For programming, multitasking, and studies, you want an excellent keyboard, vibrant high-res screen, fast NVMe SSD, and at least 16GB RAM for smooth IDE compile times. Here are my top picks:";
  }
  // 3. Smartphones / Mobile
  else if (
    promptLower.includes("phone") ||
    promptLower.includes("smartphone") ||
    promptLower.includes("mobile") ||
    promptLower.includes("camera") ||
    promptLower.includes("5g")
  ) {
    matchedProducts = MOCK_PRODUCTS.filter((p) => p.category === "Smartphones");
    responseText =
      "Looking for a cutting-edge smartphone? Whether you prioritize AI photography, all-day battery life, or silky smooth 120Hz displays, here are the standout devices:";
  }
  // 4. Budget constraints
  else if (
    promptLower.includes("budget") ||
    promptLower.includes("cheap") ||
    promptLower.includes("affordable") ||
    promptLower.includes("under") ||
    promptLower.includes("30000") ||
    promptLower.includes("20000")
  ) {
    matchedProducts = MOCK_PRODUCTS.filter((p) => p.price <= 35000);
    responseText =
      "I've selected devices that offer the maximum performance per rupee without cutting corners on display quality and daily reliability. Check these out:";
  }
  // 5. Tablets
  else if (promptLower.includes("tablet") || promptLower.includes("ipad") || promptLower.includes("draw")) {
    matchedProducts = MOCK_PRODUCTS.filter((p) => p.category === "Tablets");
    responseText =
      "Tablets are fantastic for note-taking, digital art, media consumption, and portability. Here are our premier recommendations:";
  }
  // 6. General / Fallback
  else {
    matchedProducts = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
    responseText = `I understand you're interested in "${userPrompt}". I've matched hardware specs against our catalog to recommend these versatile, high-rated options for you:`;
  }

  // Ensure at least 1-2 products
  if (matchedProducts.length === 0) {
    matchedProducts = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
  }

  return {
    message: responseText,
    recommendedProductIds: matchedProducts.slice(0, 2).map((p) => p.pId),
  };
};

export const mockConversationService = {
  // POST /api/conversations
  create: async (title = "New Consultation") => {
    await new Promise((res) => setTimeout(res, 100));
    const conversations = getStoredConversations();
    const newConver = {
      converId: conversations.length > 0 ? Math.max(...conversations.map((c) => c.converId)) + 1 : 1,
      title,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    conversations.push(newConver);
    localStorage.setItem(getConversationStorageKey(), JSON.stringify(conversations));
    return newConver;
  },

  // GET /api/conversations
  getAll: async () => {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredConversations();
  },

  // GET /api/conversations/{converId}
  getById: async (converId) => {
    await new Promise((res) => setTimeout(res, 50));
    const conversations = getStoredConversations();
    const found = conversations.find((c) => c.converId === Number(converId));
    return found || conversations[0];
  },

  // GET /api/conversations/{converId}/messages
  getMessages: async (converId) => {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredMessages(converId);
  },

  // POST /api/conversations/{converId}/messages
  sendMessage: async (converId, text) => {
    // 1. Append User Message
    const messages = getStoredMessages(converId);
    const userMsg = {
      msgId: Date.now(),
      converId: Number(converId),
      role: "USER",
      message: text,
      createdAt: new Date().toISOString(),
    };
    messages.push(userMsg);

    // 2. Simulate AI Processing Delay (400ms)
    await new Promise((res) => setTimeout(res, 400));

    // 3. Generate AI Assistant Response with recommended products
    const aiData = generateAIResponse(text);
    const aiMsg = {
      msgId: Date.now() + 1,
      converId: Number(converId),
      role: "ASSISTANT",
      message: aiData.message,
      recommendedProductIds: aiData.recommendedProductIds,
      createdAt: new Date().toISOString(),
    };
    messages.push(aiMsg);

    // 4. Save both messages to DB/localStorage
    saveStoredMessages(converId, messages);

    return aiMsg;
  },
};

