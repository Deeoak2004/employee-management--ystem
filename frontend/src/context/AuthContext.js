import React, { createContext, useState } from "react";
import { loginUser } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1]; 
      const decoded = JSON.parse(atob(payload)); 
      return decoded; 
    } catch (err) {
      console.error("Failed to decode JWT:", err);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });

      if (!res || !res.data.access_token) {
        setUser(null);
        setToken(null);
        return { success: false, userData: null };
      }

      const accessToken = res.data.access_token;
      setToken(accessToken);

      const decoded = decodeJWT(accessToken);
      if (!decoded) throw new Error("Invalid token");

      setUser({ role: decoded.role, email: decoded.sub });

      return { success: true, userData: { role: decoded.role, email: decoded.sub } };
    } catch (err) {
      console.error("Login failed:", err);
      setUser(null);
      setToken(null);
      return { success: false, userData: null };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};