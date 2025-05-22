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

  // Remove a member from a club (admin only)
  removeMember: async (clubId: number, membreId: number, adminId: number) => {
    try {
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
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/clubs/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(`Image uploaded for club ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error uploading image for club ${id}:`, error);
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
