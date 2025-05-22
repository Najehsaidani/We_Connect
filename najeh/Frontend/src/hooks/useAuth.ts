import { useEffect, useState, useCallback } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt'; // Import isTokenExpired

const useAuth = () => {
  const [userData, setUserData] = useState<{
    email?: string;
    roles?: string[];
    userId?: number | string;
  }>({});

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUserData({});
  }, []);

  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log("Token from localStorage:", token ? "Token exists" : "No token");

    // Check token expiration first
    if (isTokenExpired(token)) {
      console.log("Token is expired, clearing auth");
      clearAuth();
      return;
    }

    const decoded = decodeToken(token);
    console.log("Decoded token:", decoded);
    console.log("User roles from token:", decoded.roles);

    // Store userId in localStorage if available in token and not already in localStorage
    if (decoded.userId && !localStorage.getItem('userId')) {
      localStorage.setItem('userId', decoded.userId.toString());
      console.log("User ID stored from token during refresh:", decoded.userId);
    }

    setUserData({
      email: decoded.sub,  // Map 'sub' claim to email
      roles: decoded.roles || [],
      userId: decoded.userId || localStorage.getItem('userId')
    });

    console.log("Updated user data:", {
      email: decoded.sub,
      roles: decoded.roles || [],
      userId: decoded.userId || localStorage.getItem('userId')
    });
  }, [clearAuth]); // Add clearAuth as dependency

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role: string): boolean => {
    return userData?.roles?.includes(role) || false;
  }, [userData?.roles]);

  // Objet utilisateur pour la compatibilité
  const user = {
    id: userData.userId,
    email: userData.email,
    roles: userData.roles
  };

  useEffect(() => {
    refreshAuth();
    const interval = setInterval(refreshAuth, 300000);
    return () => clearInterval(interval);
  }, [refreshAuth]);

  return {
    ...userData,
    user,
    hasRole,
    roles: userData.roles || [],
    refreshAuth,
    clearAuth,
    isAuthenticated: !!userData?.roles?.length && !isTokenExpired(localStorage.getItem('token'))
  };
};

export default useAuth;