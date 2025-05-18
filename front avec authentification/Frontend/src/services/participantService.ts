// src/services/participantService.ts
import apiClient from './api';

/**
 * Interface for participant data
 */
export interface Participant {
  id?: number;
  userId: number;
  event: any; // Using any for now since the event structure can vary
  dateInscription: string;
  status: string;
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
          event: { id: eventId },
          dateInscription: new Date().toISOString(),
          status: 'CONFIRMED'
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
      await apiClient.delete('/participants/leave', {
        params: {
          userId,
          eventId
        }
      });
      console.log('Successfully left event');
    } catch (error) {
      console.error('Error leaving event:', error);
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
      // This endpoint might not exist in your backend
      try {
        const response = await apiClient.get(`/participants/event/${eventId}`);
        console.log(`Found ${response.data.length} participants for event ${eventId}`);
        return response.data;
      } catch (innerError) {
        console.error('Error fetching event participants, trying alternative endpoint:', innerError);
        // Try an alternative endpoint
        const response = await apiClient.get(`/events/${eventId}/participants`);
        console.log(`Found ${response.data.length} participants for event ${eventId} (alternative endpoint)`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching event participants:', error);
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock participants');
        return [
          {
            id: 1,
            userId: 1,
            event: { id: eventId },
            dateInscription: new Date().toISOString(),
            status: 'CONFIRMED'
          }
        ];
      }
      return [];
    }
  }

  /**
   * Get all events a user is participating in
   * @param userId - The ID of the user
   * @returns Promise with array of events
   */
  async getUserEvents(userId: number): Promise<any[]> {
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
}

export default new ParticipantService();
