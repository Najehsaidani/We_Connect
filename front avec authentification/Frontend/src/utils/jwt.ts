import {jwtDecode} from 'jwt-decode';

export const decodeToken = (token: string | null): { roles?: string[] } => {
    if (!token) return {};
    try {
      const decoded = jwtDecode<{ roles: string[] }>(token);
      return {
        roles: decoded.roles || [],
      };
    } catch (error) {
      console.error("Invalid token", error);
      return {};
    }
  };
// Add this to the existing decodeToken function
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
  
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };