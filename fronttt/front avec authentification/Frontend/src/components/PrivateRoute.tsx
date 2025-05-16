import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute({ isAuthenticated }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}