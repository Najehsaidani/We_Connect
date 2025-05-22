import apiClient from '../services/api';
import { EventStatus } from '@/types/event';

export interface Event {
  eventId: number;
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
  participants?: { id: number; userId: number; dateInscription: string; status: string }[];
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

export const EventsService = {
  getAllEvents: async (): Promise<Event[]> => {
    try {
      console.log('Fetching all events from API');
      const res = await apiClient.get('/events', {
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
      console.error('Error fetching events:', error);
      return [];
    }
  },

  searchEvents: async (searchTerm: string): Promise<Event[]> => {
    try {
      const res = await apiClient.get('/events/search', {
        params: { search: searchTerm },
      });
      return res.data;
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  },

  createEvent: async (
    createurId: number,
    event: Partial<Omit<Event, 'id' | 'createurId'>>
  ): Promise<Event> => {
    try {
      const eventData = {
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
        status: "ACTIVE"
      };

      const res = await apiClient.post(`/events/create?createurId=${createurId}`, eventData, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  updateEvent: async (
    id: number,
    updates: Partial<Omit<Event, 'id' | 'createurId'>>,
    createurId: number = 1
  ): Promise<Event> => {
    try {
      const res = await apiClient.put(`/events/${id}?createurId=${createurId}`, updates);
      return res.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  deleteEvent: async (
    id: number,
    createurId: number = 1
  ): Promise<void> => {
    try {
      await apiClient.delete(`/events/${id}?createurId=${createurId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  getEventParticipants: async (id: number): Promise<Participant[]> => {
    try {
      const res = await apiClient.get(`/events/${id}/participants`);
      return res.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }
  },

  uploadImage: async (id: number, file: File): Promise<string> => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid event ID for image upload');
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post(`/events/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  },

  removeImage: async (id: number): Promise<boolean> => {
    try {
      const res = await apiClient.delete(`/events/${id}/image`);
      return res.data;
    } catch (error) {
      console.error('Error removing event image:', error);
      throw error;
    }
  }
};