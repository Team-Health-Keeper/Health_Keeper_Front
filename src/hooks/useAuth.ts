import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutNotice, setShowLogoutNotice] = useState(false);
  const [logoutNoticeLeaving, setLogoutNoticeLeaving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("user");
    setIsAuthenticated(!!token);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    // show one-time logout notice
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");
    if (justLoggedOut) {
      sessionStorage.removeItem("justLoggedOut");
      setShowLogoutNotice(true);
    }
    // runtime logout event
    const onJustLoggedOut = () => setShowLogoutNotice(true);
    window.addEventListener('justLoggedOut', onJustLoggedOut);
    return () => window.removeEventListener('justLoggedOut', onJustLoggedOut);
  }, []);

  // Auto-dismiss with smooth fade-out
  useEffect(() => {
    if (!showLogoutNotice) return;
    setLogoutNoticeLeaving(false);
    const t1 = setTimeout(() => setLogoutNoticeLeaving(true), 2000);
    const t2 = setTimeout(() => setShowLogoutNotice(false), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showLogoutNotice]);

  const login = useCallback((loginData: { provider: string; name: string }) => {
    const userData = { name: loginData.name };
    setUser(userData);
    setIsAuthenticated(true);
    sessionStorage.setItem("user", JSON.stringify(userData));
    navigate("/my");
  }, [navigate]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  }, [navigate]);

  return {
    user,
    isAuthenticated,
    showLogoutNotice,
    logoutNoticeLeaving,
    login,
    logout,
    setShowLogoutNotice,
  };
}
