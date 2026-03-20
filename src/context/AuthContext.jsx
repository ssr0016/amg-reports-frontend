// /src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoadingAuth(false);
  }, []);

  const login = async (username, password) => {
    const res = await API.post("/auth/login", { username, password });
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = async () => {
    // ✅ Log logout — fire and forget, hindi natin hihintayin
    try {
      await API.post("/auth/logout-log");
    } catch {
      // silent fail — huwag i-block ang logout kahit may error sa logging
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("reportForm_new");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
