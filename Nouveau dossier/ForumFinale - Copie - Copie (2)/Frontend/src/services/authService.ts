// src/services/authService.ts
import apiClient from './api';
import { LoginRequest, RegisterRequest, VerifRequest } from '../types/auth';
import { decodeToken, isTokenExpired } from '@/utils/jwt';

export const authService = {
  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData: RegisterRequest) => {
    try {
      console.log('Envoi de la requête d\'inscription:', userData);
      const response = await apiClient.post('/auth/register', userData);
      console.log('Réponse de l\'API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  sendOtp: async (email: string) => {
    try {
      const response = await apiClient.get(`/auth/send-otp/${email}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },
  resendOtp: async (email: string) => {
    try {
      const response = await apiClient.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },


  verifyUser: async (verificationData: VerifRequest) => {
    try {
      const response = await apiClient.post('/auth/verify', verificationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Verification failed');
    }
  },

  generateResetToken: async (email: string) => {
    try {
      const response = await apiClient.post(`/auth/generate-reset-password-token?email=${ encodeURIComponent(email) }`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate reset token');
    }
  },


  validateResetToken: async (resetRequest: { email: string,resetPasswordToken:string }) => {
    try {
      const response = await apiClient.post('/auth/validate-reset-token', resetRequest);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid reset token');
    }
  },

  resetPassword: async (resetData: { email: string; newPassword: string ,confirmationPassword: string}) => {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  getUserData: () => {
    const token = localStorage.getItem('token');
    return decodeToken(token);
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');

      // Clear token and userId first to prevent unauthorized API calls
      localStorage.removeItem('token');
      localStorage.removeItem('userId');

      if (token && !isTokenExpired(token)) {
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      return { message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      return { message: 'Logged out locally' };
    }
  },
};
