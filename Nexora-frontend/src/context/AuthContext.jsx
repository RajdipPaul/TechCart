import { useState, useEffect, useCallback } from "react";
import AuthContext from "./authContext";
import { authAPI, userAPI } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize user profile on initial mount or token change
  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem("accessToken");
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const profile = await userAPI.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      return profile;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const currentToken = localStorage.getItem("accessToken");
      if (!currentToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const profile = await userAPI.getProfile();
        if (isMounted) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        if (isMounted && err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const handleUnauthorized = () => {
      if (isMounted) {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    const receivedToken = data.accessToken;

    if (!receivedToken) {
      throw new Error("No access token received from authentication server.");
    }

    localStorage.setItem("accessToken", receivedToken);
    setToken(receivedToken);

    try {
      const profile = await userAPI.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      return { token: receivedToken, user: profile };
    } catch (profileError) {
      console.warn("Login token acquired but failed to load profile:", profileError);
      return { token: receivedToken, user: null };
    }
  };

  // Register handler
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    const updated = await userAPI.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
