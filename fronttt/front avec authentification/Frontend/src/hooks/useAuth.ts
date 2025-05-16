import { useEffect, useState, useCallback } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt'; // Import isTokenExpired

const useAuth = () => {
  const [userData, setUserData] = useState<{ 
    email?: string; 
    roles?: string[] 
  }>({});

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    setUserData({});
  }, []);

  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    
    // Check token expiration first
    if (isTokenExpired(token)) {
      clearAuth();
      return;
    }

    const decoded = decodeToken(token);
    setUserData({
      email: decoded.sub,  // Map 'sub' claim to email
      roles: decoded.roles || []
    });
  }, [clearAuth]); // Add clearAuth as dependency

  useEffect(() => {
    refreshAuth();
    const interval = setInterval(refreshAuth, 300000);
    return () => clearInterval(interval);
  }, [refreshAuth]);

  return { 
    ...userData,
    refreshAuth,
    clearAuth,
    isAuthenticated: !!userData?.roles?.length && !isTokenExpired(localStorage.getItem('token'))
  };
};

export default useAuth;