import apiClient from '../services/api';
import { EventStatus } from "@/types/event";

export interface EventClub {
  id?: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  nomClub?: string;
  image?: string;
  status?: EventStatus;
  nbParticipants?: number;
  createurId: number;
  clubId?: number;
  participantsClub?: { id: number; userId: number; dateInscription: string; status: string }[];
}

export interface Participant {
  id: number;
  userId: number;
  eventId: number;
  dateInscription: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const eventsClubsService = {
  getAllEventsClubs: async (): Promise<EventClub[]> => {
    try {
      console.log('Fetching all club events from API');
      const res = await apiClient.get('/eventsClubs', {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (Array.isArray(res.data)) {
        return res.data.map((event: any) => ({
          ...event,
          status: event.status === "ACTIF" ? "ACTIVE" : (event.status || "ACTIVE")
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching club events:', error);
      return [];
    }
  },

  searchEventsClubs: async (searchTerm: string): Promise<EventClub[]> => {
    try {
      const res = await apiClient.get('/eventsClubs/search', {
        params: { search: searchTerm },
      });
      return res.data;
    } catch (error) {
      console.error('Error searching club events:', error);
      return [];
    }
  },

  createEvent: async (
    createurId: number,
    event: Partial<Omit<EventClub, 'id' | 'createurId'>>
  ): Promise<EventClub> => {
    try {
      const eventData = {
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
        nomClub: event.nomClub || 'Club',
        status: "ACTIVE",
        clubId: event.clubId || 1
      };

      const res = await apiClient.post(`/eventsClubs/create?createurId=${createurId}`, eventData, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating club event:', error);
      throw error;
    }
  },

  updateEvent: async (
    id: number,
    updates: Partial<Omit<EventClub, 'id' | 'createurId'>>,
    createurId: number = 1
  ): Promise<EventClub> => {
    try {
      const res = await apiClient.put(`/eventsClubs/${id}?createurId=${createurId}`, updates);
      return res.data;
    } catch (error) {
      console.error('Error updating club event:', error);
      throw error;
    }
  },

  deleteEvent: async (
    id: number,
    createurId: number = 1
  ): Promise<void> => {
    try {
      await apiClient.delete(`/eventsClubs/${id}?createurId=${createurId}`);
    } catch (error) {
      console.error('Error deleting club event:', error);
      throw error;
    }
  },

  getEventParticipants: async (id: number): Promise<Participant[]> => {
    try {
      const res = await apiClient.get(`/eventsClubs/${id}/participants`);
      return res.data;
    } catch (error) {
      console.error('Error fetching club event participants:', error);
      return [];
    }
  },

  uploadImage: async (id: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post(`/eventsClubs/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading club event image:', error);
      throw error;
    }
  },

  removeImage: async (id: number): Promise<boolean> => {
    try {
      const res = await apiClient.delete(`/eventsClubs/${id}/image`);
      return res.data;
    } catch (error) {
      console.error('Error removing club event image:', error);
      throw error;
    }
  }
};