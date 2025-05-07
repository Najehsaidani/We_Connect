// src/services/userService.ts
import apiClient from './api';
import { User } from '../types/user';

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user details');
    }
  },
  getUserByEmail: async (email: string): Promise<User> => {
    try {
      const response = await apiClient.get(`/users/email?email=${email}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user details');
    }
  },

  updateUser: async (id: number, userData: Partial<User>) => {
    try {
      // Filter out image field
      const { image, ...rest } = userData;
      const response = await apiClient.put(`/users/update/${id}`, rest);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  },

  deleteUser: async (id: number) => {
    try {
      const response = await apiClient.delete(`/users/delete/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  },

  uploadUserImage: async (id: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await apiClient.put(`/users/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  }
};