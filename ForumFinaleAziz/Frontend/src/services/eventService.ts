// import apiClient from '../services/api';
// import { EventData, EventStatus, DEFAULT_EVENT_STATUS } from '../types/event';

// // Define the Event interface to match the backend model
// export interface Event {
//   id?: number;
//   titre: string;
//   description: string;
//   lieu: string;
//   dateDebut: string;
//   dateFin: string;
//   nomClub?: string;
//   image?: string;
//   status?: EventStatus;
//   nbParticipants?: number;
//   createurId: number;
//   participants?: { id: number; userId: number; dateInscription: string; status: string }[]; // List of Participant objects
// }

// // Define the Participant interface
// export interface Participant {
//   id: number;
//   userId: number;
//   eventId: number;
//   dateInscription: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
// }

// // Export the service object
// export const EventsService = {
//   // Get all events
//   getAllEvents: async (): Promise<Event[]> => {
//     try {
//       console.log('Fetching all events from API');
//       // Le préfixe /api est déjà inclus dans baseURL dans api.ts
//       console.log('API URL:', apiClient.defaults.baseURL + '/events');

//       // Ajouter un timeout plus long et des headers explicites
//       const res = await apiClient.get('/events', {
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Events response status:', res.status);
//       console.log('Events response data:', res.data);

//       // Vérifier si la réponse est un tableau
//       if (Array.isArray(res.data)) {
//         console.log(`Received ${res.data.length} events`);

//         // Vérifier et corriger les statuts des événements
//         const eventsWithCorrectStatus = res.data.map((event: any) => {
//           if (!event.status) {
//             console.warn('Event has no status, setting to ACTIVE:', event);
//             event.status = "ACTIVE";
//           } else if (event.status === "ACTIF") {
//             // Corriger le statut ACTIF qui cause l'erreur 500
//             console.warn('Event has invalid status ACTIF, changing to ACTIVE:', event);
//             event.status = "ACTIVE";
//           }
//           return event;
//         });

//         return eventsWithCorrectStatus;
//       } else {
//         console.error('Response is not an array:', res.data);
//         // Si la réponse n'est pas un tableau mais contient des données, essayer de les extraire
//         if (res.data && typeof res.data === 'object') {
//           if (Array.isArray(res.data.content)) {
//             console.log('Extracted events from content property');
//             return res.data.content.map((event: any) => {
//               if (!event.status) {
//                 console.warn('Event has no status, setting to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               } else if (event.status === "ACTIF") {
//                 // Corriger le statut ACTIF qui cause l'erreur 500
//                 console.warn('Event has invalid status ACTIF, changing to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               }
//               return event;
//             });
//           } else if (res.data.events && Array.isArray(res.data.events)) {
//             console.log('Extracted events from events property');
//             return res.data.events.map((event: any) => {
//               if (!event.status) {
//                 console.warn('Event has no status, setting to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               } else if (event.status === "ACTIF") {
//                 // Corriger le statut ACTIF qui cause l'erreur 500
//                 console.warn('Event has invalid status ACTIF, changing to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               }
//               return event;
//             });
//           }
//         }

//         // Si on ne peut pas extraire les données, retourner un tableau vide
//         console.warn('Could not extract events from response, returning empty array');
//         return [];
//       }
//     } catch (error) {
//       console.error('Error fetching events:', error);
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // En cas d'erreur, retourner un tableau vide
//       console.warn('Error fetching events, returning empty array');
//       return [];
//     }
//   },

//   // Search events
//   searchEvents: async (searchTerm: string): Promise<Event[]> => {
//     try {
//       const res = await apiClient.get('/events/search', {
//         params: { search: searchTerm },
//       });
//       return res.data;
//     } catch (error) {
//       console.error('Error searching events:', error);
//       return []; // Return empty array instead of throwing
//     }
//   },

//   // Create an event
//   createEvent: async (
//     createurId: number,
//     event: Partial<Omit<Event, 'id' | 'createurId'>>
//   ): Promise<Event> => {
//     try {
//       // Format the event data to match the backend model
//       const eventData = {
//         titre: event.titre || '',
//         description: event.description || '',
//         lieu: event.lieu || '',
//         dateDebut: event.dateDebut || new Date().toISOString(),
//         dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour later
//         status: "ACTIVE" // Utiliser la chaîne exacte "ACTIVE" pour correspondre à l'enum du backend
//       };

//       console.log('Sending event data with status:', eventData.status);

//       console.log('Creating event with data:', eventData);
//       // Pass createurId as a request parameter
//       const res = await apiClient.post(`/events/create?createurId=${createurId}`, eventData, {
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });
//       console.log('Create event response:', res.data);

//       // Vérifier si la réponse contient un événement valide
//       if (res.data && res.data.id) {
//         // Vérifier et corriger le statut de l'événement
//         if (!res.data.status) {
//           console.warn('Created event has no status, setting to ACTIVE:', res.data);
//           res.data.status = "ACTIVE";
//         } else if (res.data.status === "ACTIF") {
//           // Corriger le statut ACTIF qui cause l'erreur 500
//           console.warn('Created event has invalid status ACTIF, changing to ACTIVE:', res.data);
//           res.data.status = "ACTIVE";
//         }
//         return res.data;
//       } else {
//         console.error('Invalid response data for created event:', res.data);
//         // Créer un événement minimal avec les données fournies
//         return {
//           id: Math.floor(Math.random() * 1000), // ID temporaire
//           titre: event.titre || '',
//           description: event.description || '',
//           lieu: event.lieu || '',
//           dateDebut: event.dateDebut || new Date().toISOString(),
//           dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
//           status: "ACTIVE" as any,
//           nbParticipants: 0,
//           createurId: createurId
//         };
//       }
//     } catch (error) {
//       console.error('Error creating event:', error);

//       // En cas d'erreur, créer un événement minimal avec les données fournies
//       console.warn('Error creating event, using minimal event data');
//       return {
//         id: Math.floor(Math.random() * 1000), // ID temporaire
//         titre: event.titre || '',
//         description: event.description || '',
//         lieu: event.lieu || '',
//         dateDebut: event.dateDebut || new Date().toISOString(),
//         dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
//         status: "ACTIVE" as any,
//         nbParticipants: 0,
//         createurId: createurId
//       };
//     }
//   },

//   // Update an event
//   updateEvent: async (
//     id: number,
//     updates: Partial<Omit<Event, 'id' | 'createurId'>>,
//     createurId: number = 1 // Default to admin ID if not provided
//   ): Promise<Event> => {
//     try {
//       console.log(`Updating event ${id} with data:`, updates);
//       // Pass createurId as a request parameter
//       const res = await apiClient.put(`/events/${id}?createurId=${createurId}`, updates);
//       console.log('Update event response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error updating event:', error);
//       throw error;
//     }
//   },

//   // Delete an event
//   deleteEvent: async (
//     id: number,
//     createurId: number = 1 // Default to admin ID if not provided
//   ): Promise<void> => {
//     try {
//       console.log(`Deleting event ${id}`);
//       // Pass createurId as a request parameter
//       await apiClient.delete(`/events/${id}?createurId=${createurId}`);
//       console.log(`Event ${id} deleted successfully`);
//     } catch (error) {
//       console.error('Error deleting event:', error);
//       throw error;
//     }
//   },

//   // Get event participants
//   getEventParticipants: async (id: number): Promise<Participant[]> => {
//     try {
//       console.log(`Fetching participants for event ${id}`);
//       const res = await apiClient.get(`/events/${id}/participants`);
//       console.log('Event participants response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error fetching event participants:', error);
//       return [];
//     }
//   },

//   // Upload an image for an event
//   uploadImage: async (id: number, file: File): Promise<string> => {
//     try {
//       console.log(`Uploading image for event ${id}`);
//       const formData = new FormData();
//       formData.append('file', file);

//       const res = await apiClient.post(`/events/${id}/upload`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       console.log('Image upload response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error uploading event image:', error);
//       throw error;
//     }
//   },

//   // Remove an image from an event
//   removeImage: async (id: number): Promise<boolean> => {
//     try {
//       console.log(`Removing image from event ${id}`);
//       const res = await apiClient.delete(`/events/${id}/image`);
//       console.log('Image removal response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error removing event image:', error);
//       throw error;
//     }
//   }
// };
import apiClient from '../services/api';

// Define the Event interface to match the backend model
export interface Event {
  id?: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  nomClub?: string;
  image?: string;
  status?: string;
  nbParticipants?: number;
  createurId: number;
  participants?: { id: number; userId: number; dateInscription: string; status: string }[]; // List of Participant objects
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
export const EventsService = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    try {
      console.log('Fetching all events from /events');
      const res = await apiClient.get('/events');
      console.log('Events response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Search events
  searchEvents: async (searchTerm: string): Promise<Event[]> => {
    try {
      const res = await apiClient.get('/events/search', {
        params: { search: searchTerm },
      });
      return res.data;
    } catch (error) {
      console.error('Error searching events:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create an event
  createEvent: async (
    createurId: number,
    event: Partial<Omit<Event, 'id' | 'createurId'>>
  ): Promise<Event> => {
    try {
      // Format the event data to match the backend model
      const eventData = {
        titre: event.titre || '',
        description: event.description || '',
        lieu: event.lieu || '',
        dateDebut: event.dateDebut || new Date().toISOString(),
        dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour later
        status: event.status || 'AVENIR'
      };

      console.log('Creating event with data:', eventData);
      // Pass createurId as a request parameter
      const res = await apiClient.post(`/events/create?createurId=${createurId}`, eventData);
      console.log('Create event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update an event
  updateEvent: async (
    id: number,
    updates: Partial<Omit<Event, 'id' | 'createurId'>>,
    createurId: number = 1 // Default to admin ID if not provided
  ): Promise<Event> => {
    try {
      console.log(`Updating event ${id} with data:`, updates);
      // Pass createurId as a request parameter
      const res = await apiClient.put(`/events/${id}?createurId=${createurId}`, updates);
      console.log('Update event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (
    id: number,
    createurId: number = 1 // Default to admin ID if not provided
  ): Promise<void> => {
    try {
      console.log(`Deleting event ${id}`);
      // Pass createurId as a request parameter
      await apiClient.delete(`/events/${id}?createurId=${createurId}`);
      console.log(`Event ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get event participants
  getEventParticipants: async (id: number): Promise<Participant[]> => {
    try {
      console.log(`Fetching participants for event ${id}`);
      const res = await apiClient.get(`/events/${id}/participants`);
      console.log('Event participants response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }
  },

  // Upload an image for an event
  uploadImage: async (id: number, file: File): Promise<string> => {
    try {
      console.log(`Uploading image for event ${id}`);
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post(`/events/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Image upload response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  },

  // Remove an image from an event
  removeImage: async (id: number): Promise<boolean> => {
    try {
      console.log(`Removing image from event ${id}`);
      const res = await apiClient.delete(`/events/${id}/image`);
      console.log('Image removal response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error removing event image:', error);
      throw error;
    }
  }
};