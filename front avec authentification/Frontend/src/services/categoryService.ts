import axios from 'axios';

const API_URL = 'http://localhost:8083/api/categories';  // Remplacez par l'URL de votre backend

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (category: { name: string }) => {
    try {
      const response = await axios.post(API_URL, category);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie existante
  updateCategory: async (id: number, category: { name: string }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, category);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie', error);
      throw error;
    }
  },

  // Récupérer une catégorie par son ID
  getCategoryById: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie par ID', error);
      throw error;
    }
  }
};
