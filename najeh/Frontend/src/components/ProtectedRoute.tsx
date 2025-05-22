import { useEffect, useState } from 'react'; // Add useState import
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { roles, isAuthenticated, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const verifyAuth = async () => {
      await refreshAuth();
      if (isMounted) setIsLoading(false);
    };

    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty array ensures this runs only once

  if (isLoading) return <div>Loading authentication...</div>;
  
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (!allowedRoles.some(role => roles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;