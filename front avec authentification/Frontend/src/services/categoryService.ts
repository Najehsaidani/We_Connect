import apiClient from './api';

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    try {
      console.log("Fetching all categories...");
      const response = await apiClient.get('/categories');
      console.log("Categories response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (category: { nom: string }) => {
    try {
      console.log("Creating category with data:", category);
      const response = await apiClient.post('/categories', category);
      console.log("Create category response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie existante
  updateCategory: async (id: number, category: { nom: string }) => {
    try {
      console.log("Updating category with data:", category);
      const response = await apiClient.put(`/categories/${id}`, category);
      console.log("Update category response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id: number) => {
    try {
      console.log("Deleting category with ID:", id);
      await apiClient.delete(`/categories/${id}`);
      console.log("Category deleted successfully");
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie', error);
      throw error;
    }
  },

  // Récupérer une catégorie par son ID
  getCategoryById: async (id: number) => {
    try {
      console.log("Fetching category with ID:", id);
      const response = await apiClient.get(`/categories/${id}`);
      console.log("Category by ID response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie par ID', error);
      throw error;
    }
  }
};
