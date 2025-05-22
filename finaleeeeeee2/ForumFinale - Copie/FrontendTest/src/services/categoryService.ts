// src/services/categoryService.ts
import apiClient from './api'; // comme pour clubService.ts

export const categoryService = {
  getAllCategories: async () => {
    try {
      console.log('Appel API pour récupérer les catégories...');
      const response = await apiClient.get('/categories');
      console.log('Réponse API des catégories:', response);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  createCategory: async (category: { name: string }) => {
    const response = await apiClient.post('/categories', category);
    return response.data;
  },

  updateCategory: async (id: number, category: { name: string }) => {
    const response = await apiClient.put(`/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await apiClient.delete(`/categories/${id}`);
  },

  getCategoryById: async (id: number) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }
};
