import { useEffect, useState, useCallback } from 'react';
import { decodeToken } from '../utils/jwt';

const useAuth = () => {
  const [userData, setUserData] = useState<{ email?: string; roles?: string[] }>({});

  // Memoize refreshAuth with useCallback to prevent unnecessary recreations
  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    setUserData(decoded || {});
  }, []); // Empty dependency array ensures stable function reference

  // Add periodic token check
  useEffect(() => {
    // Initial check
    refreshAuth();

    // Set up interval to check token every 5 minutes
    const interval = setInterval(refreshAuth, 300000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [refreshAuth]); // Now safe to include in dependencies

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    setUserData({});
  }, []);

  return { 
    ...userData,
    refreshAuth,
    clearAuth,
    isAuthenticated: !!userData?.roles?.length
  };
};

export default useAuth;