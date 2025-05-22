// src/services/participantService.ts
import apiClient from './api';
import { Event } from './eventService';

/**
 * Interface for participant data
 */
export interface Participant {
  id?: number;
  userId: number;
  event: Event;
  eventId?: number; // For API requests
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
 * Service for managing event participation
 */
class ParticipantService {
  /**
   * Join an event
   * @param userId - The ID of the user joining the event
   * @param eventId - The ID of the event to join
   * @returns Promise with the participant data
   */
  async joinEvent(userId: number, eventId: number): Promise<Participant> {
    try {
      console.log(`Joining event: userId=${userId}, eventId=${eventId}`);
      const response = await apiClient.post('/participants/join', null, {
        params: {
          userId,
          eventId
        }
      });
      console.log('Join event response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error joining event:', error);
      // In development mode, return a mock participant
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock participant data');
        return {
          id: Math.floor(Math.random() * 1000),
          userId: userId,
          event: {
            id: eventId,
            titre: 'Mock Event',
            description: 'This is a mock event for development',
            lieu: 'Mock Location',
            dateDebut: new Date().toISOString(),
            dateFin: new Date(Date.now() + 86400000).toISOString(),
            createurId: 1
          },
          dateInscription: new Date().toISOString(),
          status: 'CONFIRMED' as const
        };
      }
      throw error;
    }
  }

  /**
   * Leave an event
   * @param userId - The ID of the user leaving the event
   * @param eventId - The ID of the event to leave
   * @returns Promise with void response
   */
  async leaveEvent(userId: number, eventId: number): Promise<void> {
    try {
      console.log(`Leaving event: userId=${userId}, eventId=${eventId}`);

      // Use the correct endpoint from your backend controller
      await apiClient.delete('/participants/leave', {
        params: {
          userId,
          eventId
        }
      });

      console.log(`Successfully removed user ${userId} from event ${eventId}`);
    } catch (error) {
      console.error('Error leaving event:', error);

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
        console.log('Development mode: simulating successful leave event');
        return;
      }
      throw error;
    }
  }

  /**
   * Check if a user is participating in an event
   * @param userId - The ID of the user
   * @param eventId - The ID of the event
   * @returns Promise with boolean indicating participation status
   */
  async isParticipating(userId: number, eventId: number): Promise<boolean> {
    try {
      console.log(`Checking if user ${userId} is participating in event ${eventId}`);
      // This endpoint might not exist in your backend, so we'll check the user's events
      const userEvents = await this.getUserEvents(userId);
      const isParticipating = userEvents.some(event => event.id === eventId);
      console.log(`User ${userId} is ${isParticipating ? '' : 'not '}participating in event ${eventId}`);
      return isParticipating;
    } catch (error) {
      console.error('Error checking participation status:', error);
      return false;
    }
  }

  /**
   * Get all participants for an event
   * @param eventId - The ID of the event
   * @returns Promise with array of participants
   */
  async getEventParticipants(eventId: number): Promise<Participant[]> {
    try {
      console.log(`Fetching participants for event ${eventId}`);
      // Based on the ParticipantClubController, we assume a similar structure for regular participants
      const response = await apiClient.get(`/participants/event/${eventId}`);
      console.log(`Found ${response.data.length} participants for event ${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);

      // Log the specific error for debugging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Return an empty array if there's an error
      console.log('No participants found for event ID:', eventId);
      return [];
    }
  }

  /**
   * Get all events a user is participating in
   * @param userId - The ID of the user
   * @returns Promise with array of events
   */
  async getUserEvents(userId: number): Promise<Event[]> {
    try {
      console.log(`Fetching events for user ${userId}`);
      // This endpoint might not exist in your backend
      try {
        const response = await apiClient.get(`/participants/user/${userId}`);
        console.log(`Found ${response.data.length} events for user ${userId}`);
        return response.data;
      } catch (innerError) {
        console.error('Error fetching user events, trying alternative endpoint:', innerError);
        // Try an alternative endpoint
        const response = await apiClient.get(`/users/${userId}/events`);
        console.log(`Found ${response.data.length} events for user ${userId} (alternative endpoint)`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock user events');
        return [];
      }
      return [];
    }
  }

  /**
   * Update a participant's status
   * @param userId - The ID of the user
   * @param eventId - The ID of the event
   * @param status - The new status ('CONFIRMED', 'PENDING', or 'CANCELLED')
   * @returns Promise with the updated participant data
   */
  async updateParticipantStatus(userId: number, eventId: number, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): Promise<Participant> {
    try {
      console.log(`Directly updating participant status: userId=${userId}, eventId=${eventId}, status=${status}`);

      // Use the correct PATCH endpoint from your backend controller
      // Make sure to convert IDs to numbers
      const updateResponse = await apiClient.put('/participants/status', null, {
        params: {
          userId: Number(userId),
          eventId: Number(eventId),
          status: status
        }
      });

      console.log('Update participant status response:', updateResponse.data);
      return updateResponse.data;
    } catch (error) {
      console.error('Error updating participant status:', error);

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
        console.log('Development mode: returning mock updated participant data');
        return {
          id: Math.floor(Math.random() * 1000),
          userId: userId,
          event: {
            id: eventId,
            titre: 'Mock Event',
            description: 'This is a mock event for development',
            lieu: 'Mock Location',
            dateDebut: new Date().toISOString(),
            dateFin: new Date(Date.now() + 86400000).toISOString(),
            createurId: 1
          },
          dateInscription: new Date().toISOString(),
          status: status
        };
      }
      throw error;
    }
  }
}

export default new ParticipantService();
