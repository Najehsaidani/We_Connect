// src/services/clubService.ts
import apiClient from './api';
import { ClubDto, EtatClub } from '@/types/club';

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

  createClub: async (club: ClubDto): Promise<ClubDto> => {
    try {
      console.log("Creating club with data:", club);
      const response = await apiClient.post('/clubs', club);
      console.log("Club created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating club:", error);
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

  joinClub: async (clubId: number, userId: string) => {
    try {
      console.log(`User ${userId} joining club ${clubId}`);
      await apiClient.post(`/clubs/${clubId}/inscription/${userId}`);
      console.log(`User ${userId} joined club ${clubId} successfully`);
    } catch (error) {
      console.error(`Error joining club ${clubId}:`, error);
      throw error;
    }
  },

  leaveClub: async (clubId: number, userId: string) => {
    try {
      console.log(`User ${userId} leaving club ${clubId}`);
      await apiClient.delete(`/clubs/${clubId}/inscription/${userId}`);
      console.log(`User ${userId} left club ${clubId} successfully`);
    } catch (error) {
      console.error(`Error leaving club ${clubId}:`, error);
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
  }
};
