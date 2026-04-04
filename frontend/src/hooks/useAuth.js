import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser?.username ? currentUser : null);
      return Boolean(currentUser?.username);
    } catch {
      setUser(null);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const authResponse = await loginRequest(credentials);
    setUser(authResponse?.username ? authResponse : { username: credentials.username });
    return authResponse;
  }, []);

  const register = useCallback(async (credentials) => {
    return registerRequest(credentials);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.username),
      isCheckingAuth,
      register,
      login,
      logout,
      refreshSession,
    }),
    [isCheckingAuth, login, logout, refreshSession, register, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

