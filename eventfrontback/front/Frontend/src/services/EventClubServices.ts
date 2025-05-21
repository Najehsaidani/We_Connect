import apiClient from '../services/api';
import { EventClubData, EventStatus } from '../types/event';

// Define the EventClub interface to match the backend model
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
  participantsClub?: { id: number; userId: number; dateInscription: string; status: string }[]; // List of ParticipantClub objects
}

// Define the Participant interface
export interface Participant {
  id: number;
  userId: number;
  eventId: number;
  dateInscription: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Export the service object
export const eventsClubsService = {
  // Get all eventsClubs
  getAllEventsClubs: async (): Promise<EventClub[]> => {
    try {
      console.log('Fetching all club events from API');
      // Le préfixe /api est déjà inclus dans baseURL dans api.ts
      console.log('API URL:', apiClient.defaults.baseURL + '/eventsClubs');

      // Ajouter un timeout plus long et des headers explicites
      const res = await apiClient.get('/eventsClubs', {
        timeout: 15000, // 15 secondes de timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Club events response status:', res.status);
      console.log('Club events response data:', res.data);

      // Vérifier si la réponse est un tableau
      if (Array.isArray(res.data)) {
        console.log(`Received ${res.data.length} club events`);

        // Vérifier et corriger les statuts des événements
        const eventsWithCorrectStatus = res.data.map((event: any) => {
          if (!event.status) {
            console.warn('Club event has no status, setting to ACTIVE:', event);
            event.status = "ACTIVE";
          } else if (event.status === "ACTIF") {
            // Corriger le statut ACTIF qui cause l'erreur 500
            console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
            event.status = "ACTIVE";
          }
          return event;
        });

        return eventsWithCorrectStatus;
      } else {
        console.error('Response is not an array:', res.data);
        // Si la réponse n'est pas un tableau mais contient des données, essayer de les extraire
        if (res.data && typeof res.data === 'object') {
          if (Array.isArray(res.data.content)) {
            console.log('Extracted club events from content property');
            return res.data.content.map((event: any) => {
              if (!event.status) {
                console.warn('Club event has no status, setting to ACTIVE:', event);
                event.status = "ACTIVE";
              } else if (event.status === "ACTIF") {
                // Corriger le statut ACTIF qui cause l'erreur 500
                console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
                event.status = "ACTIVE";
              }
              return event;
            });
          } else if (res.data.eventsClubs && Array.isArray(res.data.eventsClubs)) {
            console.log('Extracted club events from eventsClubs property');
            return res.data.eventsClubs.map((event: any) => {
              if (!event.status) {
                console.warn('Club event has no status, setting to ACTIVE:', event);
                event.status = "ACTIVE";
              } else if (event.status === "ACTIF") {
                // Corriger le statut ACTIF qui cause l'erreur 500
                console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
                event.status = "ACTIVE";
              }
              return event;
            });
          }
        }

        // Si on ne peut pas extraire les données, retourner un tableau vide
        console.warn('Could not extract club events from response, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error fetching club events:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // En cas d'erreur, retourner un tableau vide
      console.warn('Error fetching club events, returning empty array');
      return [];
    }
  },

  // Search eventsClubs
  searchEventsClubs: async (searchTerm: string): Promise<EventClub[]> => {
    try {
      const res = await apiClient.get('/eventsClubs/search', {
        params: { search: searchTerm },
      });
      return res.data;
    } catch (error) {
      console.error('Error searching club events:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create an event
  createEvent: async (
    createurId: number,
    event: Partial<Omit<EventClub, 'id' | 'createurId'>>
  ): Promise<EventClub> => {
    try {
      // Format the event data to match the backend model
      const eventData = {
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour later
        nomClub: event.nomClub || 'Club',
        status: "ACTIVE", // Utiliser la chaîne exacte "ACTIVE" pour correspondre à l'enum du backend
        clubId: event.clubId || 1 // Default club ID
      };

      console.log('Sending club event data with status:', eventData.status);

      console.log('Creating club event with data:', eventData);
      // Pass createurId as a request parameter
      const res = await apiClient.post(`/eventsClubs/create?createurId=${createurId}`, eventData, {
        timeout: 15000, // 15 secondes de timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Create club event response:', res.data);

      // Vérifier si la réponse contient un événement valide
      if (res.data && res.data.id) {
        // Vérifier et corriger le statut de l'événement
        if (!res.data.status) {
          console.warn('Created club event has no status, setting to ACTIVE:', res.data);
          res.data.status = "ACTIVE";
        } else if (res.data.status === "ACTIF") {
          // Corriger le statut ACTIF qui cause l'erreur 500
          console.warn('Created club event has invalid status ACTIF, changing to ACTIVE:', res.data);
          res.data.status = "ACTIVE";
        }
        return res.data;
      } else {
        console.error('Invalid response data for created club event:', res.data);
        // Créer un événement minimal avec les données fournies
        return {
          id: Math.floor(Math.random() * 1000), // ID temporaire
          titre: event.titre || '',
          description: event.description || '',
          lieu: event.lieu || '',
          dateDebut: event.dateDebut || new Date().toISOString(),
          dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
          nomClub: event.nomClub || 'Club',
          status: "ACTIVE" as any,
          nbParticipants: 0,
          createurId: createurId,
          clubId: event.clubId || 1
        };
      }
    } catch (error) {
      console.error('Error creating club event:', error);

      // En cas d'erreur, créer un événement minimal avec les données fournies
      console.warn('Error creating club event, using minimal event data');
      return {
        id: Math.floor(Math.random() * 1000), // ID temporaire
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
        nomClub: event.nomClub || 'Club',
        status: "ACTIVE" as any,
        nbParticipants: 0,
        createurId: createurId,
        clubId: event.clubId || 1
      };
    }
  },

  // Update an event
  updateEvent: async (
    id: number,
    updates: Partial<Omit<EventClub, 'id' | 'createurId'>>,
    createurId: number = 1 // Default to admin ID if not provided
  ): Promise<EventClub> => {
    try {
      console.log(`Updating club event ${id} with data:`, updates);
      // Pass createurId as a request parameter
      const res = await apiClient.put(`/eventsClubs/${id}?createurId=${createurId}`, updates);
      console.log('Update club event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error updating club event:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (
    id: number,
    createurId: number = 1 // Default to admin ID if not provided
  ): Promise<void> => {
    try {
      console.log(`Deleting club event ${id}`);
      // Pass createurId as a request parameter
      await apiClient.delete(`/eventsClubs/${id}?createurId=${createurId}`);
      console.log(`Club event ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting club event:', error);
      throw error;
    }
  },

  // Get event participants
  getEventParticipants: async (id: number): Promise<Participant[]> => {
    try {
      console.log(`Fetching participants for club event ${id}`);
      const res = await apiClient.get(`/eventsClubs/${id}/participants`);
      console.log('Club event participants response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching club event participants:', error);
      return [];
    }
  },

  // Upload an image for a club event
  uploadImage: async (id: number, file: File): Promise<string> => {
    try {
      console.log(`Uploading image for club event ${id}`);
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post(`/eventsClubs/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Club event image upload response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error uploading club event image:', error);
      throw error;
    }
  },

  // Remove an image from a club event
  removeImage: async (id: number): Promise<boolean> => {
    try {
      console.log(`Removing image from club event ${id}`);
      const res = await apiClient.delete(`/eventsClubs/${id}/image`);
      console.log('Club event image removal response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error removing club event image:', error);
      throw error;
    }
  }
};