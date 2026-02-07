import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    if (api.isAuthenticated() && !user) {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.login(email, password);

      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.message || "Login failed");
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || "Login failed");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.register(userData);

      if (response.success) {
        // Auto-login after registration
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        setError(response.message || "Registration failed");
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || "Registration failed");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.updateProfile(profileData);

      if (response.success) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        return { success: true };
      } else {
        setError(response.message || "Update failed");
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || "Update failed");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
