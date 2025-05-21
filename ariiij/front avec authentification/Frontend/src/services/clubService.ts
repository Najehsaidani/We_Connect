// src/services/clubService.ts
import apiClient from './api';
import { ClubDto, EtatClub, CreateClubRequest } from '@/types/club';

export const clubService = {
  getAllClubs: async (): Promise<ClubDto[]> => {
    try {
      const response = await apiClient.get('/clubs');
      console.log("Clubs API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all clubs:", error);
      throw error;
    }
  },

  getClubById: async (id: number): Promise<ClubDto> => {
    try {
      const response = await apiClient.get(`/clubs/${id}`);
      console.log(`Club ${id} details:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching club ${id}:`, error);
      throw error;
    }
  },

  createClub: async (clubData: Partial<CreateClubRequest>): Promise<ClubDto> => {
    try {
      console.log("Creating club with data:", JSON.stringify(clubData, null, 2));

      // Vérifier que les champs obligatoires sont présents
      if (!clubData.nom) {
        throw new Error("Le nom du club est obligatoire");
      }
      if (!clubData.description) {
        throw new Error("La description du club est obligatoire");
      }
      if (!clubData.categoryId) {
        throw new Error("L'ID de la catégorie est obligatoire");
      }

      // Convertir categoryId en nombre si c'est une chaîne
      let categoryId = clubData.categoryId;
      if (typeof categoryId === 'string') {
        categoryId = parseInt(categoryId, 10);
        if (isNaN(categoryId)) {
          throw new Error("L'ID de la catégorie doit être un nombre valide");
        }
      }

      // Formater la date de création exactement comme dans Postman: "YYYY-MM-DD"
      let dateCreation = clubData.dateCreation;
      if (!dateCreation) {
        // Si aucune date n'est fournie, utiliser la date actuelle au format YYYY-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateCreation = `${year}-${month}-${day}`; // Format YYYY-MM-DD
      } else if (dateCreation.includes('T')) {
        // Si la date est au format ISO complet, la convertir en YYYY-MM-DD
        dateCreation = dateCreation.split('T')[0];
      }

      // S'assurer que la date est au format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateCreation)) {
        try {
          // Essayer de convertir la date en format YYYY-MM-DD
          const date = new Date(dateCreation);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          dateCreation = `${year}-${month}-${day}`;
        } catch (e) {
          console.warn("Impossible de formater la date de création:", e);
          // Utiliser une date par défaut
          dateCreation = "2023-11-15"; // Comme dans Postman
        }
      }

      // Créer l'objet de requête dans le format exact attendu par le backend
      const createClubRequest: CreateClubRequest = {
        nom: clubData.nom,
        description: clubData.description,
        categoryId: categoryId as number,
        dateCreation: dateCreation,
        // Ajouter createurId avec une valeur par défaut de 1 (comme dans Postman)
        createurId: clubData.createurId || 1
      };

      // Convertir l'objet en JSON exactement comme dans Postman
      const jsonData = JSON.stringify(createClubRequest);
      console.log("Sending club data to API:", jsonData);

      // Envoyer la requête avec les en-têtes appropriés
      const response = await apiClient.post('/clubs', jsonData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Club created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating club:", error);
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  updateClub: async (id: number, club: Partial<ClubDto>): Promise<ClubDto> => {
    try {
      console.log(`Updating club ${id} with data:`, club);
      const response = await apiClient.put(`/clubs/${id}`, club);
      console.log("Club updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating club ${id}:`, error);
      throw error;
    }
  },

  deleteClub: async (id: number) => {
    try {
      console.log(`Deleting club ${id}`);
      await apiClient.delete(`/clubs/${id}`);
      console.log(`Club ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting club ${id}:`, error);
      throw error;
    }
  },

  joinClub: async (clubId: number, userId: number) => {
    try {
      console.log(`User ${userId} joining club ${clubId}`);
      await apiClient.post(`/clubs/${clubId}/inscription/${userId}`);
      console.log(`User ${userId} joined club ${clubId} successfully`);
    } catch (error) {
      console.error(`Error joining club ${clubId}:`, error);
      throw error;
    }
  },

  leaveClub: async (clubId: number, userId: number) => {
    try {
      console.log(`User ${userId} leaving club ${clubId}`);
      await apiClient.delete(`/clubs/${clubId}/inscription/${userId}`);
      console.log(`User ${userId} left club ${clubId} successfully`);
    } catch (error) {
      console.error(`Error leaving club ${clubId}:`, error);
      throw error;
    }
  },

  // Get all members of a club
  getClubMembers: async (clubId: number) => {
    try {
      console.log(`Fetching members for club ${clubId}`);
      const response = await apiClient.get(`/clubs/${clubId}/membres`);
      console.log(`Members for club ${clubId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for club ${clubId}:`, error);
      throw error;
    }
  },

  // Remove a member from a club (admin only)
  removeMember: async (clubId: number, membreId: number, adminId: number) => {
    try {
      // Vérifier que l'administrateur ne tente pas de se supprimer lui-même
      if (membreId === adminId) {
        console.error(`Admin ${adminId} attempted to remove themselves from club ${clubId}`);
        throw new Error("Un administrateur ne peut pas se supprimer lui-même du club");
      }

      console.log(`Admin ${adminId} removing member ${membreId} from club ${clubId}`);
      await apiClient.delete(`/clubs/${clubId}/membres/${membreId}?adminId=${adminId}`);
      console.log(`Member ${membreId} removed from club ${clubId} successfully`);
    } catch (error) {
      console.error(`Error removing member ${membreId} from club ${clubId}:`, error);
      throw error;
    }
  },

  searchClubs: async (search = '', category?: string): Promise<ClubDto[]> => {
    try {
      const params = new URLSearchParams();
      params.append('search', search);
      if (category) params.append('category', category);

      console.log(`Searching clubs with params: ${params.toString()}`);
      const response = await apiClient.get(`/clubs/search?${params.toString()}`);
      console.log("Search results:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error searching clubs:", error);
      throw error;
    }
  },

  getPendingClubs: async (): Promise<ClubDto[]> => {
    try {
      console.log("Fetching pending clubs");
      const response = await apiClient.get('/clubs/en-attente');
      console.log("Pending clubs:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending clubs:", error);
      throw error;
    }
  },

  // Update the member count for a club
  updateClubMemberCount: async (clubId: number, memberCount: number): Promise<ClubDto> => {
    try {
      console.log(`Updating member count for club ${clubId} to ${memberCount}`);
      // This is a client-side update only, not sending to backend
      // We'll update the club object when we fetch it next time
      return { id: clubId, membres: memberCount } as ClubDto;
    } catch (error) {
      console.error(`Error updating member count for club ${clubId}:`, error);
      throw error;
    }
  },

  acceptClub: async (id: number): Promise<ClubDto> => {
    try {
      console.log(`Accepting club ${id}`);
      const response = await apiClient.post(`/clubs/${id}/accepter`);
      console.log(`Club ${id} accepted:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error accepting club ${id}:`, error);
      throw error;
    }
  },

  rejectClub: async (id: number): Promise<ClubDto> => {
    try {
      console.log(`Rejecting club ${id}`);
      const response = await apiClient.post(`/clubs/${id}/refuser`);
      console.log(`Club ${id} rejected:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting club ${id}:`, error);
      throw error;
    }
  },

  // This method might need to be updated based on backend implementation
  updateClubStatus: async (id: number, status: string): Promise<ClubDto> => {
    try {
      console.log(`Updating club ${id} status to ${status}`);

      // If the status is one of the EtatClub enum values, use the appropriate endpoint
      if (status === EtatClub.ACCEPTER) {
        return await clubService.acceptClub(id);
      } else if (status === EtatClub.REFUSER) {
        return await clubService.rejectClub(id);
      } else if (status === EtatClub.EN_ATTENTE) {
        // For EN_ATTENTE, use the generic update method
        console.log(`Setting club ${id} to EN_ATTENTE status`);
        const response = await apiClient.put(`/clubs/${id}`, { etat: EtatClub.EN_ATTENTE });
        console.log(`Club ${id} set to EN_ATTENTE:`, response.data);
        return response.data;
      }

      // Otherwise use the generic status update endpoint
      const response = await apiClient.put(`/clubs/${id}`, { etat: status });
      console.log(`Club ${id} status updated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating club ${id} status:`, error);
      throw error;
    }
  },

  // Upload an image for a club
  uploadImage: async (id: number, file: File): Promise<string> => {
    try {
      console.log(`Uploading image for club ${id}`);

      // Vérifier que le fichier est valide
      if (!file || !(file instanceof File)) {
        throw new Error("Le fichier d'image est invalide");
      }

      // Vérifier que le fichier est une image
      if (!file.type.startsWith('image/')) {
        throw new Error("Le fichier doit être une image");
      }

      // Créer un FormData et ajouter le fichier
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Sending image upload request for club ${id}`);

      // Supprimer l'en-tête Content-Type pour laisser le navigateur le définir avec la boundary
      const response = await apiClient.post(`/clubs/${id}/upload`, formData, {
        headers: {
          // Ne pas définir Content-Type ici, le navigateur le fera automatiquement avec la boundary
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(`Image uploaded for club ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error uploading image for club ${id}:`, error);
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  // Remove the image of a club
  removeImage: async (id: number): Promise<boolean> => {
    try {
      console.log(`Removing image for club ${id}`);
      const response = await apiClient.delete(`/clubs/${id}/image`);
      console.log(`Image removed for club ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error removing image for club ${id}:`, error);
      throw error;
    }
  }
};
