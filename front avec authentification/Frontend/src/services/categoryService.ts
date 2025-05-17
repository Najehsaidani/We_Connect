import axios from 'axios';
import apiClient from './api';
  // Remplacez par l'URL de votre backend

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    try {
      const response = await axios.get(apiClient + '/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (category: { name: string }) => {
    try {
      const response = await axios.post(apiClient +'/categories', category);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie existante
  updateCategory: async (id: number, category: { name: string }) => {
    try {
      const response = await axios.put(`${apiClient + '/categories'}/${id}`, category);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id: number) => {
    try {
      await axios.delete(`${apiClient + '/categories'}/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie', error);
      throw error;
    }
  },

  // Récupérer une catégorie par son ID
  getCategoryById: async (id: number) => {
    try {
      const response = await axios.get(`${apiClient + '/categories'}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie par ID', error);
      throw error;
    }
  }
};
