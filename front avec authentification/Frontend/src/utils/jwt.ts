import { jwtDecode } from 'jwt-decode';

// Define an interface for the JWT payload including all possible claims
interface JwtPayload {
  sub?: string;       // Subject (user's email)
  roles?: string[];   // User roles
  exp?: number;       // Expiration timestamp
  iat?: number;       // Issued at timestamp
  [key: string]: any; // Allow any other claims
}

export const decodeToken = (token: string | null): JwtPayload => {
  if (!token) return {};
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return {};
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    // Treat token as expired if 'exp' is missing
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    return true;
  }
};