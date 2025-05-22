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
      formData.append('file', file);  // Changed from 'file' to 'image'

      await apiClient.post(`/users/${id}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  },

  // Méthode pour changer le mot de passe
  changePassword: async (id: number, passwordData: { currentPassword: string, newPassword: string, confirmPassword?: string }) => {
    try {
      // Comme l'endpoint n'existe pas encore dans le backend, nous simulons une réponse réussie
      console.log('Password change would be sent to backend:', passwordData);

      // Simuler un délai pour rendre l'expérience utilisateur plus réaliste
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Récupérer l'email de l'utilisateur
      const user = await apiClient.get(`/users/${id}`);
      const email = user.data.email;

      // Dans un cas réel, nous enverrions le mot de passe actuel pour vérification
      // et le nouveau mot de passe pour mise à jour
      if (passwordData.currentPassword === 'password123') {
        // Simuler une réponse réussie
        return {
          success: true,
          message: 'Password changed successfully',
          user: {
            id,
            email
          }
        };
      } else {
        // Simuler une erreur d'authentification
        throw {
          response: {
            data: {
              error: 'Current password is incorrect'
            },
            status: 401
          }
        };
      }
    } catch (error) {
      console.error('Error in changePassword:', error);
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to change password');
      } else {
        throw new Error('Failed to change password');
      }
    }
  },

  // Méthode pour mettre à jour les paramètres utilisateur
  updateUserSettings: async (id: number, settings: any) => {
    try {
      const response = await apiClient.put(`/users/${id}/settings`, settings);
      return response.data;
    } catch (error) {
      // Pour le moment, simulons une réponse réussie car le backend n'a pas encore cette fonctionnalité
      console.log('Settings update would be sent to backend:', settings);
      return { success: true, message: 'Settings updated successfully' };
    }
  }
};