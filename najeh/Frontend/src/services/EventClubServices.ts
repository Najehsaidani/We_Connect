import apiClient from '../services/api';
import { EventStatus } from "@/types/event";

export interface EventClub {
  eventClubId: number;
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
      const res = await apiClient.get('/clubs/events', {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (Array.isArray(res.data)) {
        return res.data.map((event: any) => {
          // Mapper le statut selon les valeurs de l'enum EventStatus dans club.ts
          let mappedStatus = event.status;
          if (event.status === "ACTIF") {
            mappedStatus = "EN_COURS";
          } else if (event.status === "ACTIVE") {
            mappedStatus = "EN_COURS";
          } else if (event.status === "INACTIVE") {
            mappedStatus = "ANNULE";
          } else if (event.status === "TERMINE") {
            mappedStatus = "PASSE";
          }

          return {
            ...event,
            status: mappedStatus || "AVENIR"
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching club events:', error);
      return [];
    }
  },

  searchEventsClubs: async (searchTerm: string): Promise<EventClub[]> => {
    try {
      const res = await apiClient.get('/clubs/events/search', {
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
      // Normaliser le statut de l'événement pour le backend
      let status = event.status || "AVENIR";

      // Mapper les statuts entre les différentes énumérations
      switch (status) {
        case 'ACTIVE':
          status = 'EN_COURS' as any;
          break;
        case 'INACTIVE':
          status = 'ANNULE' as any;
          break;
        case 'TERMINE':
          status = 'PASSE' as any;
          break;
        // Pas besoin de mapper AVENIR car il existe dans les deux enums
      }

      const eventData = {
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
        nomClub: event.nomClub || 'Club',
        status: status,
        clubId: event.clubId || 1
      };

      const res = await apiClient.post(`/clubs/events/club/${eventData.clubId}?createurId=${createurId}`, eventData, {
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
      // Normaliser le statut de l'événement pour le backend
      // Créer une copie des mises à jour sans le createurId
      let normalizedUpdates = { ...updates };

      // Supprimer createurId du corps de la requête s'il existe
      if ('createurId' in normalizedUpdates) {
        delete (normalizedUpdates as any).createurId;
      }

      // Si le statut est défini, le normaliser selon l'enum EventStatus de club.ts
      if (normalizedUpdates.status) {
        // Mapper les statuts entre les différentes énumérations
        switch (normalizedUpdates.status) {
          case 'ACTIVE':
            normalizedUpdates.status = 'EN_COURS' as any;
            break;
          case 'INACTIVE':
            normalizedUpdates.status = 'ANNULE' as any;
            break;
          case 'TERMINE':
            normalizedUpdates.status = 'PASSE' as any;
            break;
          // Pas besoin de mapper AVENIR car il existe dans les deux enums
        }
      }

      console.log(`Updating club event ${id} with normalized data:`, normalizedUpdates);

      // Vérifier si clubId est présent dans les données
      if (!normalizedUpdates.clubId && normalizedUpdates.clubId !== 0) {
        console.warn("clubId is missing in update data, adding default value");
        normalizedUpdates.clubId = 1; // Valeur par défaut
      }

      // Utiliser le createurId comme paramètre d'URL, comme attendu par le backend
      console.log(`Sending update request for club event ${id} with createurId=${createurId}`);

      const res = await apiClient.put(`/clubs/events/${id}?createurId=${createurId}`, normalizedUpdates);
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
      console.log(`Deleting club event ${id} with createurId ${createurId}`);

      // Utiliser uniquement le createurId comme paramètre d'URL, comme attendu par le backend
      await apiClient.delete(`/clubs/events/${id}?createurId=${createurId}`);
      console.log(`Successfully deleted club event ${id}`);
    } catch (error) {
      console.error('Error deleting club event:', error);
      throw error;
    }
  },

  getEventParticipants: async (id: number): Promise<Participant[]> => {
    try {
      const res = await apiClient.get(`/clubs/events/${id}/participants`);
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

      const res = await apiClient.post(`/clubs/events/${id}/upload`, formData, {
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
      const res = await apiClient.delete(`/clubs/events/${id}/image`);
      return res.data;
    } catch (error) {
      console.error('Error removing club event image:', error);
      throw error;
    }
  }
};