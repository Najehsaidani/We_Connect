// // src/services/participantClubService.ts
// import apiClient from './api';
// import { EventClub } from './EventClubServices';

// /**
//  * Interface for participant club data
//  */
// export interface ParticipantClub {
//   id?: number;
//   userId: number;
//   eventClub: EventClub;
//   eventClubId?: number; // For API requests
//   dateInscription: string;
//   status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'; // Matches ParticipantStatus enum in backend
//   // Additional fields for UI display
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   user?: {
//     id: number;
//     firstName?: string;
//     lastName?: string;
//     email?: string;
//     image?: string;
//     departement?: string;
//   };
// }

// /**
//  * Service for managing club event participation
//  */
// class ParticipantClubService {
//   /**
//    * Join a club event
//    * @param userId - The ID of the user joining the event
//    * @param eventClubId - The ID of the club event to join
//    * @returns Promise with the participant data
//    */
//   async joinEvent(userId: number, eventClubId: number): Promise<ParticipantClub> {
//     try {
//       console.log(`Joining club event: userId=${userId}, eventClubId=${eventClubId}`);
//       console.log('API URL:', apiClient.defaults.baseURL + '/participantsClub/join');

//       // Use the correct POST endpoint from the updated backend controller
//       const response = await apiClient.post('/participantsClub/join', null, {
//         params: {
//           userId: Number(userId),
//           eventClubId: Number(eventClubId)
//         },
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Join club event response status:', response.status);
//       console.log('Join club event response data:', response.data);

//       // Vérifier si la réponse contient des données
//       if (response.data) {
//         return response.data;
//       } else {
//         console.error('Empty response data when joining club event');
//         // Créer un objet participant minimal
//         return {
//           id: Math.floor(Math.random() * 1000),
//           userId: userId,
//           eventClub: {
//             id: eventClubId,
//             titre: 'Événement de club',
//             description: 'Aucune description disponible',
//             lieu: 'Campus',
//             dateDebut: new Date().toISOString(),
//             dateFin: new Date(Date.now() + 86400000).toISOString(),
//             nomClub: 'Club',
//             createurId: userId,
//             clubId: 1
//           },
//           dateInscription: new Date().toISOString(),
//           status: 'CONFIRMED' as const
//         };
//       }
//     } catch (error) {
//       console.error('Error joining club event:', error);

//       // Log more detailed error information
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // Essayer une méthode alternative
//       try {
//         console.log('Trying alternative endpoint for joining club event');
//         const altResponse = await apiClient.post('/participantsClub', {
//           userId: Number(userId),
//           eventClubId: Number(eventClubId),
//           status: 'CONFIRMED'
//         }, {
//           timeout: 15000,
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('Alternative method successful');
//         if (altResponse.data) {
//           return altResponse.data;
//         }
//       } catch (altError) {
//         console.error('Alternative method also failed:', altError);
//       }

//       // In development mode, return a mock participant
//       if (process.env.NODE_ENV === 'development') {
//         console.log('Development mode: returning mock participant club data');
//         return {
//           id: Math.floor(Math.random() * 1000),
//           userId: userId,
//           eventClub: {
//             id: eventClubId,
//             titre: 'Mock Club Event',
//             description: 'This is a mock club event for development',
//             lieu: 'Mock Location',
//             dateDebut: new Date().toISOString(),
//             dateFin: new Date(Date.now() + 86400000).toISOString(),
//             nomClub: 'Mock Club',
//             createurId: 1,
//             clubId: 1
//           },
//           dateInscription: new Date().toISOString(),
//           status: 'CONFIRMED' as const
//         };
//       }
//       throw error;
//     }
//   }

//   /**
//    * Leave a club event
//    * @param userId - The ID of the user leaving the event
//    * @param eventClubId - The ID of the club event to leave
//    * @returns Promise with void response
//    */
//   async leaveEvent(userId: number, eventClubId: number): Promise<void> {
//     try {
//       console.log(`Leaving club event: userId=${userId}, eventClubId=${eventClubId}`);
//       console.log('API URL:', apiClient.defaults.baseURL + '/participantsClub/leave');

//       // Use the correct DELETE endpoint from the updated backend controller
//       const response = await apiClient.delete('/participantsClub/leave', {
//         params: {
//           userId: Number(userId),
//           eventClubId: Number(eventClubId)
//         },
//         timeout: 15000, // 15 secondes de timeout
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Leave club event response status:', response.status);
//       console.log(`Successfully removed user ${userId} from club event ${eventClubId}`);
//     } catch (error) {
//       console.error('Error leaving club event:', error);

//       // Log more detailed error information
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // Essayer une méthode alternative
//       try {
//         console.log('Trying alternative endpoint for leaving club event');
//         await apiClient.post('/participantsClub/cancel', null, {
//           params: {
//             userId: Number(userId),
//             eventClubId: Number(eventClubId)
//           },
//           timeout: 15000,
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         });
//         console.log('Alternative method successful');
//         return;
//       } catch (altError) {
//         console.error('Alternative method also failed:', altError);

//         // Essayer une autre méthode alternative
//         try {
//           console.log('Trying second alternative method for leaving club event');
//           // Trouver d'abord l'ID du participant
//           const findResponse = await apiClient.get(`/participantsClub/find`, {
//             params: {
//               userId: Number(userId),
//               eventClubId: Number(eventClubId)
//             },
//             timeout: 15000,
//             headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json'
//             }
//           });

//           if (findResponse.data && findResponse.data.id) {
//             const participantId = findResponse.data.id;
//             console.log(`Found participant ID: ${participantId}`);

//             // Supprimer le participant par son ID
//             await apiClient.delete(`/participantsClub/${participantId}`, {
//               timeout: 15000,
//               headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//               }
//             });
//             console.log('Second alternative method successful');
//             return;
//           }
//         } catch (secondAltError) {
//           console.error('Second alternative method also failed:', secondAltError);
//         }
//       }

//       // In development mode, just log and continue
//       if (process.env.NODE_ENV === 'development') {
//         console.log('Development mode: simulating successful leave club event');
//         return;
//       }
//       throw error;
//     }
//   }

//   /**
//    * Check if a user is participating in a club event
//    * @param userId - The ID of the user
//    * @param eventClubId - The ID of the club event
//    * @returns Promise with boolean indicating participation status
//    */
//   async isParticipating(userId: number, eventClubId: number): Promise<boolean> {
//     try {
//       console.log(`Checking if user ${userId} is participating in club event ${eventClubId}`);
//       // This endpoint might not exist in your backend, so we'll check the user's events
//       const userEvents = await this.getUserEvents(userId);
//       const isParticipating = userEvents.some(event => event.id === eventClubId);
//       console.log(`User ${userId} is ${isParticipating ? '' : 'not '}participating in club event ${eventClubId}`);
//       return isParticipating;
//     } catch (error) {
//       console.error('Error checking participation status:', error);
//       return false;
//     }
//   }

//   /**
//    * Get all participants for a club event
//    * @param eventClubId - The ID of the club event
//    * @returns Promise with array of participants
//    */
//   async getEventParticipants(eventClubId: number): Promise<ParticipantClub[]> {
//     try {
//       console.log(`Fetching participants for club event ${eventClubId}`);

//       // Use the exact endpoint from the updated backend controller
//       const response = await apiClient.get(`/participantsClub/eventClub/${Number(eventClubId)}`);

//       console.log(`Found ${response.data.length} participants for club event ${eventClubId}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching club event participants:', error);

//       // Log the specific error for debugging
//       if (error.response) {
//         console.error('Error response:', error.response.status, error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // Return an empty array if there's an error
//       console.log('No participants found for club event ID:', eventClubId);
//       return [];
//     }
//   }

//   /**
//    * Get all club events a user is participating in
//    * @param userId - The ID of the user
//    * @returns Promise with array of club events
//    */
//   async getUserEvents(userId: number): Promise<EventClub[]> {
//     try {
//       console.log(`Fetching club events for user ${userId}`);

//       // Utiliser l'endpoint correct du backend
//       try {
//         // Cet endpoint est défini dans ParticipantClubController.java
//         console.log(`API URL for user club events: ${apiClient.defaults.baseURL}/participantsClub/user/${Number(userId)}`);

//         const response = await apiClient.get(`/participantsClub/user/${Number(userId)}`, {
//           timeout: 15000, // 15 secondes de timeout
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('User club events response status:', response.status);
//         console.log('Raw user club events data:', response.data);

//         // Vérifier si les données sont dans le format attendu
//         if (!response.data) {
//           console.error('No data received for user club events');
//           return [];
//         }

//         let participantsData = response.data;

//         // Vérifier si la réponse est un tableau ou un objet contenant un tableau
//         if (!Array.isArray(participantsData)) {
//           console.log('Response is not an array, trying to extract data');
//           if (typeof participantsData === 'object') {
//             if (Array.isArray(participantsData.content)) {
//               console.log('Extracted participants from content property');
//               participantsData = participantsData.content;
//             } else if (participantsData.participants && Array.isArray(participantsData.participants)) {
//               console.log('Extracted participants from participants property');
//               participantsData = participantsData.participants;
//             } else {
//               console.error('Could not extract participants data from response');
//               return [];
//             }
//           } else {
//             console.error('Invalid data format for user club events');
//             return [];
//           }
//         }

//         console.log(`Processing ${participantsData.length} club participants`);

//         // Convertir les données de participation en événements
//         // Les données retournées sont des objets ParticipantClub, pas des EventClub
//         const events = participantsData.map(participant => {
//           try {
//             if (!participant) {
//               console.warn('Null participant found');
//               return null;
//             }

//             if (participant.eventClub) {
//               console.log('Found eventClub in participant:', participant.eventClub);
//               // Vérifier si l'événement a toutes les propriétés nécessaires
//               const event = participant.eventClub;
//               if (!event.id && event.id !== 0) {
//                 console.warn('Club event has no ID, using participant eventClubId');
//                 event.id = participant.eventClubId || 0;
//               }
//               return event;
//             } else if (participant.eventClubId || participant.eventClubId === 0) {
//               console.log('Found eventClubId in participant:', participant.eventClubId);
//               // Si l'événement n'est pas inclus dans la réponse, créer un objet minimal
//               return {
//                 id: participant.eventClubId,
//                 titre: participant.eventTitle || 'Événement de club',
//                 description: participant.eventDescription || '',
//                 lieu: participant.eventLocation || '',
//                 dateDebut: participant.eventDate || new Date().toISOString(),
//                 dateFin: new Date().toISOString(),
//                 nomClub: participant.clubName || 'Club',
//                 createurId: participant.eventCreatorId || 0,
//                 clubId: participant.clubId || 0,
//                 status: 'ACTIVE' // Utiliser la valeur correcte pour le backend
//               };
//             } else {
//               console.warn('Participant has no eventClub or eventClubId:', participant);
//               return null;
//             }
//           } catch (mapError) {
//             console.error('Error mapping participant to club event:', mapError, participant);
//             return null;
//           }
//         }).filter(Boolean); // Filtrer les valeurs null

//         console.log('Mapped club events:', events);
//         return events;
//       } catch (innerError) {
//         console.error('Error fetching user club events:', innerError);

//         // Log détaillé de l'erreur
//         if (innerError.response) {
//           console.error('Response status:', innerError.response.status);
//           console.error('Response data:', innerError.response.data);
//         } else if (innerError.request) {
//           console.error('No response received:', innerError.request);
//         } else {
//           console.error('Error setting up request:', innerError.message);
//         }

//         // Essayer une méthode alternative
//         try {
//           console.log('Trying alternative endpoint for user club events');
//           const altResponse = await apiClient.get(`/users/${userId}/eventsClubs`, {
//             timeout: 15000,
//             headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json'
//             }
//           });

//           console.log('Alternative method successful');
//           console.log('Alternative response data:', altResponse.data);

//           if (Array.isArray(altResponse.data)) {
//             return altResponse.data;
//           } else if (altResponse.data && typeof altResponse.data === 'object') {
//             if (Array.isArray(altResponse.data.eventsClubs)) {
//               return altResponse.data.eventsClubs;
//             }
//           }
//         } catch (altError) {
//           console.error('Alternative method also failed:', altError);
//         }

//         // Retourner un tableau vide en cas d'erreur
//         return [];
//       }
//     } catch (error) {
//       console.error('Error fetching user club events:', error);

//       // Log détaillé de l'erreur
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       return [];
//     }
//   }

//   /**
//    * Update a participant's status in a club event
//    * @param userId - The ID of the user
//    * @param eventClubId - The ID of the club event
//    * @param status - The new status ('CONFIRMED', 'PENDING', or 'CANCELLED')
//    * @returns Promise with the updated participant data
//    */
//   async updateParticipantStatus(userId: number, eventClubId: number, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): Promise<ParticipantClub> {
//     try {
//       console.log(`Directly updating club participant status: userId=${userId}, eventClubId=${eventClubId}, status=${status}`);

//       // Use the correct PUT endpoint from the updated backend controller
//       // Make sure to convert IDs to numbers
//       const updateResponse = await apiClient.put('/participantsClub/status', null, {
//         params: {
//           userId: Number(userId),
//           eventClubId: Number(eventClubId),
//           status: status
//         }
//       });

//       console.log('Update club participant status response:', updateResponse.data);
//       return updateResponse.data;
//     } catch (error) {
//       console.error('Error updating club participant status:', error);

//       // Log more detailed error information
//       if (error.response) {
//         console.error('Error response:', error.response.status, error.response.data);
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//       } else {
//         console.error('Error setting up request:', error.message);
//       }

//       // In development mode, return a mock updated participant
//       if (process.env.NODE_ENV === 'development') {
//         console.log('Development mode: returning mock updated club participant data');
//         return {
//           id: Math.floor(Math.random() * 1000),
//           userId: userId,
//           eventClub: {
//             id: eventClubId,
//             titre: 'Mock Club Event',
//             description: 'This is a mock club event for development',
//             lieu: 'Mock Location',
//             dateDebut: new Date().toISOString(),
//             dateFin: new Date(Date.now() + 86400000).toISOString(),
//             nomClub: 'Mock Club',
//             createurId: 1,
//             clubId: 1
//           },
//           dateInscription: new Date().toISOString(),
//           status: status
//         };
//       }
//       throw error;
//     }
//   }
// }

// export default new ParticipantClubService();
// src/services/participantClubService.ts
import apiClient from './api';
import { EventClub } from './EventClubServices';

/**
 * Interface for participant club data
 */
export interface ParticipantClub {
  id?: number;
  userId: number;
  eventClub: EventClub;
  eventClubId?: number; // For API requests
  dateInscription: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'; // Matches ParticipantStatus enum in backend
  // Additional fields for UI display
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string;
    departement?: string;
  };
}

/**
 * Service for managing club event participation
 */
class ParticipantClubService {
  /**
   * Join a club event
   * @param userId - The ID of the user joining the event
   * @param eventClubId - The ID of the club event to join
   * @returns Promise with the participant data
   */
  async joinEvent(userId: number, eventClubId: number): Promise<ParticipantClub> {
    try {
      console.log(`Joining club event: userId=${userId}, eventClubId=${eventClubId}`);

      // Use the correct POST endpoint from the updated backend controller
      const response = await apiClient.post('/participantsClub/join', null, {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId)
        }
      });

      console.log('Join club event response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error joining club event:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // In development mode, return a mock participant
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock participant club data');
        return {
          id: Math.floor(Math.random() * 1000),
          userId: userId,
          eventClub: {
            id: eventClubId,
            titre: 'Mock Club Event',
            description: 'This is a mock club event for development',
            lieu: 'Mock Location',
            dateDebut: new Date().toISOString(),
            dateFin: new Date(Date.now() + 86400000).toISOString(),
            nomClub: 'Mock Club',
            createurId: 1,
            clubId: 1
          },
          dateInscription: new Date().toISOString(),
          status: 'CONFIRMED' as const
        };
      }
      throw error;
    }
  }

  /**
   * Leave a club event
   * @param userId - The ID of the user leaving the event
   * @param eventClubId - The ID of the club event to leave
   * @returns Promise with void response
   */
  async leaveEvent(userId: number, eventClubId: number): Promise<void> {
    try {
      console.log(`Leaving club event: userId=${userId}, eventClubId=${eventClubId}`);

      // Use the correct DELETE endpoint from the updated backend controller
      await apiClient.delete('/participantsClub/leave', {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId)
        }
      });

      console.log(`Successfully removed user ${userId} from club event ${eventClubId}`);
    } catch (error) {
      console.error('Error leaving club event:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // In development mode, just log and continue
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: simulating successful leave club event');
        return;
      }
      throw error;
    }
  }

  /**
   * Check if a user is participating in a club event
   * @param userId - The ID of the user
   * @param eventClubId - The ID of the club event
   * @returns Promise with boolean indicating participation status
   */
  async isParticipating(userId: number, eventClubId: number): Promise<boolean> {
    try {
      console.log(`Checking if user ${userId} is participating in club event ${eventClubId}`);
      // This endpoint might not exist in your backend, so we'll check the user's events
      const userEvents = await this.getUserEvents(userId);
      const isParticipating = userEvents.some(event => event.id === eventClubId);
      console.log(`User ${userId} is ${isParticipating ? '' : 'not '}participating in club event ${eventClubId}`);
      return isParticipating;
    } catch (error) {
      console.error('Error checking participation status:', error);
      return false;
    }
  }

  /**
   * Get all participants for a club event
   * @param eventClubId - The ID of the club event
   * @returns Promise with array of participants
   */
  async getEventParticipants(eventClubId: number): Promise<ParticipantClub[]> {
    try {
      console.log(`Fetching participants for club event ${eventClubId}`);

      // Use the exact endpoint from the updated backend controller
      const response = await apiClient.get(`/participantsClub/eventClub/${Number(eventClubId)}`);

      console.log(`Found ${response.data.length} participants for club event ${eventClubId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching club event participants:', error);

      // Log the specific error for debugging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Return an empty array if there's an error
      console.log('No participants found for club event ID:', eventClubId);
      return [];
    }
  }

  /**
   * Get all club events a user is participating in
   * @param userId - The ID of the user
   * @returns Promise with array of club events
   */
  async getUserEvents(userId: number): Promise<EventClub[]> {
    try {
      console.log(`Fetching club events for user ${userId}`);

      // Use the exact endpoint from the updated backend controller
      try {
        const response = await apiClient.get(`/participantsClub/user/${Number(userId)}`);
        console.log(`Found ${response.data.length} club events for user ${userId}`);
        return response.data;
      } catch (innerError) {
        console.error('Error fetching user club events, trying alternative endpoint:', innerError);

        // Log the specific error for debugging
        if (innerError.response) {
          console.error('Error response:', innerError.response.status, innerError.response.data);
        } else if (innerError.request) {
          console.error('No response received:', innerError.request);
        } else {
          console.error('Error setting up request:', innerError.message);
        }

        // Try an alternative endpoint
        const response = await apiClient.get(`/users/${Number(userId)}/eventsClubs`);
        console.log(`Found ${response.data.length} club events for user ${userId} (alternative endpoint)`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user club events:', error);

      // Log the specific error for debugging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock user club events');
        return [];
      }
      return [];
    }
  }

  /**
   * Update a participant's status in a club event
   * @param userId - The ID of the user
   * @param eventClubId - The ID of the club event
   * @param status - The new status ('CONFIRMED', 'PENDING', or 'CANCELLED')
   * @returns Promise with the updated participant data
   */
  async updateParticipantStatus(userId: number, eventClubId: number, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): Promise<ParticipantClub> {
    try {
      console.log(`Directly updating club participant status: userId=${userId}, eventClubId=${eventClubId}, status=${status}`);

      // Use the correct PUT endpoint from the updated backend controller
      // Make sure to convert IDs to numbers
      const updateResponse = await apiClient.put('/participantsClub/status', null, {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId),
          status: status
        }
      });

      console.log('Update club participant status response:', updateResponse.data);
      return updateResponse.data;
    } catch (error) {
      console.error('Error updating club participant status:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // In development mode, return a mock updated participant
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock updated club participant data');
        return {
          id: Math.floor(Math.random() * 1000),
          userId: userId,
          eventClub: {
            id: eventClubId,
            titre: 'Mock Club Event',
            description: 'This is a mock club event for development',
            lieu: 'Mock Location',
            dateDebut: new Date().toISOString(),
            dateFin: new Date(Date.now() + 86400000).toISOString(),
            nomClub: 'Mock Club',
            createurId: 1,
            clubId: 1
          },
          dateInscription: new Date().toISOString(),
          status: status
        };
      }
      throw error;
    }
  }
}

export default new ParticipantClubService();
