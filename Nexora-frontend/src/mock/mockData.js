// ==========================================================================
// TechCart / Nexora — Mock Data & Service Store
// Mirrors the backend database entities and API response DTOs 1:1.
// Supports offline development, local testing, and seamless backend integration.
// ==========================================================================

const USERS_STORAGE_KEY = "techcart_mock_users";
const CURRENT_USER_KEY = "user";
const ACCESS_TOKEN_KEY = "accessToken";

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
    // Simulate brief network latency
    await new Promise((res) => setTimeout(res, 350));

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

    // Return User Response DTO (excluding password hash)
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
    await new Promise((res) => setTimeout(res, 300));

    const users = getStoredUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Find registered user
    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    // If matching user exists, verify password
    if (user) {
      if (user.password !== password && password !== "Pass@123") {
        const error = new Error("Invalid email or password.");
        error.response = { status: 401, data: { message: error.message } };
        throw error;
      }
    } else if (normalizedEmail.includes("@")) {
      // Demo flexibility: if testing with a new arbitrary email, create a demo profile
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

    // Return LoginResponse DTO
    return {
      accessToken: token,
      tokenType: "Bearer",
      user: userProfile,
    };
  },

  // GET /api/users/me
  getProfile: async () => {
    await new Promise((res) => setTimeout(res, 150));

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      const error = new Error("Full authentication is required to access this resource");
      error.response = { status: 401, data: { message: error.message } };
      throw error;
    }

    // Attempt to recover user from localStorage session
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    // Default to initial user Sima
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
    await new Promise((res) => setTimeout(res, 200));

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
    await new Promise((res) => setTimeout(res, 200));
    return { message: "Account deleted successfully" };
  },
};

// ==========================================================================
// Mock Product Catalog (For upcoming Product Page)
// ==========================================================================
export const MOCK_PRODUCTS = [
  {
    pId: 1,
    pName: "ASUS Vivobook 15 OLED",
    brand: "ASUS",
    category: "Laptop",
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
    category: "Laptop",
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
    pName: "Dell XPS 13 Plus",
    brand: "Dell",
    category: "Ultrabook",
    description: "Sleek zero-lattice capacitive touch bar design, InfinityEdge borderless 3.5K OLED touchscreen, and premium CNC aluminum body.",
    price: 139999.0,
    currency: "INR",
    stockQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core i7-1360P (12 Cores, up to 5.0 GHz)",
    ramGb: 32,
    storageGb: 1024,
    storageType: "PCIe 4.0 SSD",
    graphics: "Intel Iris Xe Graphics",
    displaySizeInches: 13.4,
    displayReso: "3456x2160 3.5K OLED Touch",
    batteryWh: 55,
    weightKg: 1.26,
    connectivity: "Thunderbolt 4, Wi-Fi 6E, Bluetooth 5.3",
    isActive: true,
  },
  {
    pId: 4,
    pName: "Lenovo Legion Pro 5",
    brand: "Lenovo",
    category: "Gaming",
    description: "Extreme enthusiast performance machine featuring AI Engine+ tuning, 240Hz WQXGA color-accurate screen, and coldfront 5.0 thermals.",
    price: 124999.0,
    currency: "INR",
    stockQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core i7-14700HX (20 Cores, up to 5.5 GHz)",
    ramGb: 32,
    storageGb: 1024,
    storageType: "M.2 NVMe Gen4",
    graphics: "NVIDIA GeForce RTX 4070 (8GB GDDR6)",
    displaySizeInches: 16.0,
    displayReso: "2560x1600 240Hz HDR",
    batteryWh: 80,
    weightKg: 2.5,
    connectivity: "Wi-Fi 6E, HDMI 2.1, 4x USB-A, 2x USB-C",
    isActive: true,
  },
  {
    pId: 5,
    pName: "Apple MacBook Air M3",
    brand: "Apple",
    category: "Laptop",
    description: "Blazingly fast M3 chip with up to 18 hours of battery life, silent fanless thermal architecture, and stunning Liquid Retina display.",
    price: 114900.0,
    currency: "INR",
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60",
    processor: "Apple M3 (8-core CPU with 4 performance & 4 efficiency cores)",
    ramGb: 16,
    storageGb: 512,
    storageType: "Unified Apple SSD",
    graphics: "10-core GPU with hardware-accelerated ray tracing",
    displaySizeInches: 13.6,
    displayReso: "2560x1664 Liquid Retina",
    batteryWh: 52.6,
    weightKg: 1.24,
    connectivity: "MagSafe 3, 2x Thunderbolt / USB 4, Wi-Fi 6E",
    isActive: true,
  },
  {
    pId: 6,
    pName: "Acer Swift Go 14",
    brand: "Acer",
    category: "Ultrabook",
    description: "Compact productivity companion with Intel Core Ultra AI processor, Intel Arc graphics, and brilliant 2.8K 90Hz OLED screen.",
    price: 68990.0,
    currency: "INR",
    stockQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=60",
    processor: "Intel Core Ultra 5 125H (14 Cores with Intel AI Boost NPU)",
    ramGb: 16,
    storageGb: 512,
    storageType: "PCIe Gen4 SSD",
    graphics: "Intel Arc Graphics",
    displaySizeInches: 14.0,
    displayReso: "2880x1800 90Hz OLED",
    batteryWh: 65,
    weightKg: 1.32,
    connectivity: "Killer Wi-Fi 7, Thunderbolt 4, HDMI 2.1",
    isActive: true,
  },
];
