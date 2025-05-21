// import apiClient from '../services/api';
// import { EventClubData, EventStatus } from '../types/event';

// // Define the EventClub interface to match the backend model
// export interface EventClub {
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
//   clubId?: number;
//   participantsClub?: { id: number; userId: number; dateInscription: string; status: string }[]; // List of ParticipantClub objects
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
// export const eventsClubsService = {
//   // Get all eventsClubs
//   getAllEventsClubs: async (): Promise<EventClub[]> => {
//     try {
//       console.log('Fetching all club events from API');
//       // Le préfixe /api est déjà inclus dans baseURL dans api.ts
//       console.log('API URL:', apiClient.defaults.baseURL + '/eventsClubs');

//       // Ajouter un timeout plus long et des headers explicites
//       const res = await apiClient.get('/eventsClubs', {
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Club events response status:', res.status);
//       console.log('Club events response data:', res.data);

//       // Vérifier si la réponse est un tableau
//       if (Array.isArray(res.data)) {
//         console.log(`Received ${res.data.length} club events`);

//         // Vérifier et corriger les statuts des événements
//         const eventsWithCorrectStatus = res.data.map((event: any) => {
//           if (!event.status) {
//             console.warn('Club event has no status, setting to ACTIVE:', event);
//             event.status = "ACTIVE";
//           } else if (event.status === "ACTIF") {
//             // Corriger le statut ACTIF qui cause l'erreur 500
//             console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
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
//             console.log('Extracted club events from content property');
//             return res.data.content.map((event: any) => {
//               if (!event.status) {
//                 console.warn('Club event has no status, setting to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               } else if (event.status === "ACTIF") {
//                 // Corriger le statut ACTIF qui cause l'erreur 500
//                 console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               }
//               return event;
//             });
//           } else if (res.data.eventsClubs && Array.isArray(res.data.eventsClubs)) {
//             console.log('Extracted club events from eventsClubs property');
//             return res.data.eventsClubs.map((event: any) => {
//               if (!event.status) {
//                 console.warn('Club event has no status, setting to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               } else if (event.status === "ACTIF") {
//                 // Corriger le statut ACTIF qui cause l'erreur 500
//                 console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', event);
//                 event.status = "ACTIVE";
//               }
//               return event;
//             });
//           }
//         }

//         // Si on ne peut pas extraire les données, retourner un tableau vide
//         console.warn('Could not extract club events from response, returning empty array');
//         return [];
//       }
//     } catch (error) {
//       console.error('Error fetching club events:', error);
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // En cas d'erreur, retourner un tableau vide
//       console.warn('Error fetching club events, returning empty array');
//       return [];
//     }
//   },

//   // Search eventsClubs
//   searchEventsClubs: async (searchTerm: string): Promise<EventClub[]> => {
//     try {
//       const res = await apiClient.get('/eventsClubs/search', {
//         params: { search: searchTerm },
//       });
//       return res.data;
//     } catch (error) {
//       console.error('Error searching club events:', error);
//       return []; // Return empty array instead of throwing
//     }
//   },

//   // Get a single event by ID
//   getEventById: async (id: number): Promise<EventClub> => {
//     try {
//       console.log(`Fetching club event with ID ${id}`);
//       const res = await apiClient.get(`/eventsClubs/${id}`);
//       console.log('Club event response:', res.data);

//       // Vérifier et corriger le statut de l'événement
//       if (!res.data.status) {
//         console.warn('Club event has no status, setting to ACTIVE:', res.data);
//         res.data.status = "ACTIVE";
//       } else if (res.data.status === "ACTIF") {
//         // Corriger le statut ACTIF qui cause l'erreur 500
//         console.warn('Club event has invalid status ACTIF, changing to ACTIVE:', res.data);
//         res.data.status = "ACTIVE";
//       }

//       return res.data;
//     } catch (error) {
//       console.error(`Error fetching club event with ID ${id}:`, error);
//       throw error;
//     }
//   },

//   // Create an event
//   createEvent: async (
//     createurId: number,
//     event: Partial<Omit<EventClub, 'id' | 'createurId'>>
//   ): Promise<EventClub> => {
//     try {
//       // Format the event data to match the backend model
//       const eventData = {
//         titre: event.titre || '',
//         description: event.description || '',
//         lieu: event.lieu || '',
//         dateDebut: event.dateDebut || new Date().toISOString(),
//         dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(), // 1 hour later
//         nomClub: event.nomClub || 'Club',
//         status: "ACTIVE", // Utiliser la chaîne exacte "ACTIVE" pour correspondre à l'enum du backend
//         clubId: event.clubId || 1 // Default club ID
//       };

//       console.log('Sending club event data with status:', eventData.status);

//       console.log('Creating club event with data:', eventData);
//       // Pass createurId as a request parameter
//       const res = await apiClient.post(`/eventsClubs/create?createurId=${createurId}`, eventData, {
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });
//       console.log('Create club event response:', res.data);

//       // Vérifier si la réponse contient un événement valide
//       if (res.data && res.data.id) {
//         // Vérifier et corriger le statut de l'événement
//         if (!res.data.status) {
//           console.warn('Created club event has no status, setting to ACTIVE:', res.data);
//           res.data.status = "ACTIVE";
//         } else if (res.data.status === "ACTIF") {
//           // Corriger le statut ACTIF qui cause l'erreur 500
//           console.warn('Created club event has invalid status ACTIF, changing to ACTIVE:', res.data);
//           res.data.status = "ACTIVE";
//         }
//         return res.data;
//       } else {
//         console.error('Invalid response data for created club event:', res.data);
//         // Créer un événement minimal avec les données fournies
//         return {
//           id: Math.floor(Math.random() * 1000), // ID temporaire
//           titre: event.titre || '',
//           description: event.description || '',
//           lieu: event.lieu || '',
//           dateDebut: event.dateDebut || new Date().toISOString(),
//           dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
//           nomClub: event.nomClub || 'Club',
//           status: "ACTIVE" as any,
//           nbParticipants: 0,
//           createurId: createurId,
//           clubId: event.clubId || 1
//         };
//       }
//     } catch (error) {
//       console.error('Error creating club event:', error);

//       // En cas d'erreur, créer un événement minimal avec les données fournies
//       console.warn('Error creating club event, using minimal event data');
//       return {
//         id: Math.floor(Math.random() * 1000), // ID temporaire
//         titre: event.titre || '',
//         description: event.description || '',
//         lieu: event.lieu || '',
//         dateDebut: event.dateDebut || new Date().toISOString(),
//         dateFin: event.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
//         nomClub: event.nomClub || 'Club',
//         status: "ACTIVE" as any,
//         nbParticipants: 0,
//         createurId: createurId,
//         clubId: event.clubId || 1
//       };
//     }
//   },

//   // Update an event
//   updateEvent: async (
//     id: number,
//     updates: Partial<Omit<EventClub, 'id' | 'createurId'>>,
//     createurId: number = 1 // Default to admin ID if not provided
//   ): Promise<EventClub> => {
//     try {
//       console.log(`Updating club event ${id} with data:`, updates);

//       // Récupérer d'abord l'événement existant pour s'assurer que nous avons toutes les données
//       let existingEvent: EventClub;
//       try {
//         const getRes = await apiClient.get(`/eventsClubs/${id}`);
//         existingEvent = getRes.data;
//         console.log('Existing club event data:', existingEvent);
//       } catch (getError) {
//         console.error('Error fetching existing club event:', getError);
//         // Si nous ne pouvons pas obtenir l'événement existant, continuez avec les mises à jour partielles
//         existingEvent = {
//           id: id,
//           titre: updates.titre || '',
//           description: updates.description || '',
//           lieu: updates.lieu || '',
//           dateDebut: updates.dateDebut || new Date().toISOString(),
//           dateFin: updates.dateFin || new Date().toISOString(),
//           status: updates.status || 'ACTIVE',
//           createurId: createurId,
//           nomClub: updates.nomClub || '',
//           clubId: updates.clubId || 0
//         };
//       }

//       // Fusionner les mises à jour avec les données existantes
//       const completeData = {
//         ...existingEvent,
//         ...updates,
//         // S'assurer que ces champs sont toujours présents et correctement formatés
//         id: id,
//         createurId: createurId,
//         status: updates.status || existingEvent.status || 'ACTIVE'
//       };

//       // Supprimer les champs qui ne doivent pas être envoyés au backend
//       delete completeData.participantsClub;

//       console.log('Sending complete data for update:', completeData);

//       // Pass createurId as a request parameter
//       const res = await apiClient.put(`/eventsClubs/${id}?createurId=${createurId}`, completeData);
//       console.log('Update club event response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error updating club event:', error);
//       throw error;
//     }
//   },

//   // Fonction spécifique pour annuler un événement (mettre son statut à INACTIVE)
//   cancelEvent: async (
//     id: number,
//     createurId: number = 1 // Default to admin ID if not provided
//   ): Promise<EventClub> => {
//     try {
//       console.log(`Cancelling club event ${id}`);

//       // Utiliser une approche différente - appeler un endpoint spécifique pour l'annulation
//       // Cela évite les problèmes potentiels avec la mise à jour complète de l'événement
//       const res = await apiClient.post(`/eventsClubs/${id}/cancel?createurId=${createurId}`);
//       console.log('Cancel club event response:', res.data);

//       // Si l'endpoint spécifique n'existe pas, le serveur renverra une erreur 404
//       // Dans ce cas, nous essayons une approche alternative
//       return res.data;
//     } catch (error) {
//       console.error('Error with direct cancellation, trying alternative approach:', error);

//       try {
//         // Approche alternative - utiliser une requête PATCH pour ne mettre à jour que le statut
//         const patchRes = await apiClient.patch(`/eventsClubs/${id}/status?createurId=${createurId}`, {
//           status: "INACTIVE"
//         });
//         console.log('Patch status response:', patchRes.data);
//         return patchRes.data;
//       } catch (patchError) {
//         console.error('Error with PATCH approach, trying final fallback:', patchError);

//         // Dernière tentative - simuler l'annulation côté client
//         // Récupérer l'événement actuel
//         const getRes = await apiClient.get(`/eventsClubs/${id}`);
//         const event = getRes.data;

//         // Créer un événement simulé avec statut INACTIVE
//         const simulatedEvent = {
//           ...event,
//           status: "INACTIVE"
//         };

//         console.warn('Using client-side simulation for event cancellation');
//         return simulatedEvent;
//       }
//     }
//   },

//   // Delete an event
//   deleteEvent: async (
//     id: number,
//     createurId: number = 1 // Default to admin ID if not provided
//   ): Promise<void> => {
//     try {
//       console.log(`Deleting club event ${id}`);

//       // Ajouter des options supplémentaires pour la requête
//       const options = {
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       };

//       try {
//         // Première tentative avec la méthode standard
//         await apiClient.delete(`/eventsClubs/${id}?createurId=${createurId}`, options);
//         console.log(`Club event ${id} deleted successfully`);
//       } catch (deleteError) {
//         console.error('Error with standard delete, trying alternative approach:', deleteError);

//         // Approche alternative - utiliser une requête POST vers un endpoint spécifique
//         await apiClient.post(`/eventsClubs/${id}/delete?createurId=${createurId}`);
//         console.log(`Club event ${id} deleted successfully with alternative approach`);
//       }
//     } catch (error) {
//       console.error('Error deleting club event:', error);

//       // Log more detailed error information
//       if (error.response) {
//         console.error('Error response:', error.response.status, error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // Même si la suppression échoue, nous ne lançons pas d'erreur
//       // pour permettre à l'interface utilisateur de continuer à fonctionner
//       console.warn('Suppression failed but continuing UI operation');
//     }
//   },

//   // Get event participants
//   getEventParticipants: async (id: number): Promise<Participant[]> => {
//     try {
//       console.log(`Fetching participants for club event ${id}`);
//       const res = await apiClient.get(`/eventsClubs/${id}/participants`);
//       console.log('Club event participants response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error fetching club event participants:', error);
//       return [];
//     }
//   },

//   // Upload an image for a club event
//   uploadImage: async (id: number, file: File): Promise<string> => {
//     try {
//       console.log(`Uploading image for club event ${id}`);
//       const formData = new FormData();
//       formData.append('file', file);

//       const res = await apiClient.post(`/eventsClubs/${id}/upload`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       console.log('Club event image upload response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error uploading club event image:', error);
//       throw error;
//     }
//   },

//   // Remove an image from a club event
//   removeImage: async (id: number): Promise<boolean> => {
//     try {
//       console.log(`Removing image from club event ${id}`);
//       const res = await apiClient.delete(`/eventsClubs/${id}/image`);
//       console.log('Club event image removal response:', res.data);
//       return res.data;
//     } catch (error) {
//       console.error('Error removing club event image:', error);
//       throw error;
//     }
//   }
// };
import apiClient from '../services/api';

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
  status?: string;
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
      console.log('Fetching all club events from /eventsClubs');
      const res = await apiClient.get('/eventsClubs');
      console.log('Club events response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching club events:', error);
      return []; // Return empty array instead of throwing
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
        status: event.status || 'AVENIR',
        clubId: event.clubId || 1 // Default club ID
      };

      console.log('Creating club event with data:', eventData);
      // Pass createurId as a request parameter
      const res = await apiClient.post(`/eventsClubs/create?createurId=${createurId}`, eventData);
      console.log('Create club event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating club event:', error);
      throw error;
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

  // Fonction spécifique pour annuler un événement (mettre son statut à INACTIVE)
  cancelEvent: async (
    id: number,
    createurId: number = 1 // Default to admin ID if not provided
  ): Promise<EventClub> => {
    try {
      console.log(`Cancelling club event ${id}`);

      // Approche simplifiée - envoyer uniquement le statut
      const updateData = {
        status: "INACTIVE"
      };

      console.log(`Sending simple status update to /eventsClubs/${id}?createurId=${createurId}:`, updateData);
      const res = await apiClient.put(`/eventsClubs/${id}?createurId=${createurId}`, updateData);
      console.log('Cancel club event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error cancelling club event:', error);

      try {
        // Approche alternative - utiliser PATCH au lieu de PUT
        console.log('Trying PATCH approach');
        const patchRes = await apiClient.patch(`/eventsClubs/${id}/status?createurId=${createurId}`, {
          status: "INACTIVE"
        });
        console.log('Patch status response:', patchRes.data);
        return patchRes.data;
      } catch (patchError) {
        console.error('Error with PATCH approach:', patchError);
        throw error; // Relancer l'erreur originale
      }
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