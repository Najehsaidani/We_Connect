import { useEffect, useState, useCallback } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt'; // Import isTokenExpired
import { decode } from 'punycode';

const useAuth = () => {
  const [userData, setUserData] = useState<{ 
    email?: string; 
    roles?: string[] 
    userId?: number | string;
  }>({});

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
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

    if(decoded.userId && !localStorage.getItem('userId')) {
      localStorage.setItem('userId', decoded.userId.toString());
      console.log("User ID stored from decoded token:", decoded.userId);
    }
    setUserData({
      email: decoded.sub,  // Map 'sub' claim to email
      roles: decoded.roles || [],
      userId: decoded.userId || localStorage.getItem('userId')
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