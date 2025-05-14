// src/services/clubService.ts
import apiClient from './api';
import { ClubDto } from '@/types/club'; // Crée ou ajuste ce type selon ton DTO

export const clubService = {
  getAllClubs: async (): Promise<ClubDto[]> => {
    const response = await apiClient.get('/clubs');
    return response.data;
  },

  getClubById: async (id: number): Promise<ClubDto> => {
    const response = await apiClient.get(`/clubs/${id}`);
    return response.data;
  },

  createClub: async (club: ClubDto): Promise<ClubDto> => {
    const response = await apiClient.post('/clubs', club);
    return response.data;
  },

  updateClub: async (id: number, club: Partial<ClubDto>): Promise<ClubDto> => {
    const response = await apiClient.put(`/clubs/${id}`, club);
    return response.data;
  },

  deleteClub: async (id: number) => {
    await apiClient.delete(`/clubs/${id}`);
  },

  joinClub: async (clubId: number, userId: string) => {
    await apiClient.post(`/clubs/${clubId}/inscription/${userId}`);
  },

  leaveClub: async (clubId: number, userId: string) => {
    await apiClient.delete(`/clubs/${clubId}/inscription/${userId}`);
  },

  searchClubs: async (search = '', category?: string): Promise<ClubDto[]> => {
    const params = new URLSearchParams();
    params.append('search', search);
    if (category) params.append('category', category);

    const response = await apiClient.get(`/clubs/search?${params.toString()}`);
    return response.data;
  },

  getPendingClubs: async (): Promise<ClubDto[]> => {
    const response = await apiClient.get('/clubs/en-attente');
    return response.data;
  },

  acceptClub: async (id: number): Promise<ClubDto> => {
    const response = await apiClient.post(`/clubs/${id}/accepter`);
    return response.data;
  },

  rejectClub: async (id: number): Promise<ClubDto> => {
    const response = await apiClient.post(`/clubs/${id}/refuser`);
    return response.data;
  }
};
