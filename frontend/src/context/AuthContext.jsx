import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores current user info
  const [loading, setLoading] = useState(true); // For initial auth check
  const [error, setError] = useState(null);

  //* Fetch user on initial load
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/users/current-user");
      setUser(data.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  //* Login
  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/users/login", {
        usernameOrEmail,
        password,
      });

      setUser(data.data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  //* Signup
const signup = async (formData) => {
  try {
    setLoading(true);
    const { data } = await axios.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setUser(data.data);
    return { success: true };
  } catch (err) {
    setError(err.response?.data?.message || "Signup failed");
    return {
      success: false,
      message: err.response?.data?.message || "Signup failed",
    };
  } finally {
    setLoading(false);
  }
};


  //* Logout
const logout = async () => {
  try {
    await axios.post("/users/logout"); // was GET — now correct and clean
    setUser(null);
  } catch (err) {
    console.error("Logout error:", err);
  }
};


  return (
    <AuthContext.Provider
      value={{ user, setUser, login, signup, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
