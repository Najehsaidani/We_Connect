// src/services/roleService.ts
import apiClient from './api';


export const roleService = {
  assignRole: async (userId: number, role: string) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, {
        role
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign role');
    }
  },

  getUserRole: async (userId: number) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/role`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user role');
    }
  },

  updateUserStatus: async (userId: number, status: string) => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/Status`, {
        status
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }
};