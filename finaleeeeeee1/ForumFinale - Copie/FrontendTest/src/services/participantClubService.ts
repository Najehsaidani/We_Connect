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
