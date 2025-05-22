import apiClient from './api';
import { Event } from './eventService';

export interface Participant {
  id?: number;
  userId: number;
  event: Event;
  eventId?: number;
  dateInscription: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
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

class ParticipantService {
  async joinEvent(userId: number, eventId: number): Promise<Participant> {
    try {
      const response = await apiClient.post('/participants/join', null, {
        params: {
          userId: Number(userId),
          eventId: Number(eventId)
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  }

  async leaveEvent(userId: number, eventId: number): Promise<void> {
    try {
      await apiClient.delete('/participants/leave', {
        params: {
          userId: Number(userId),
          eventId: Number(eventId)
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  }

  async isParticipating(userId: number, eventId: number): Promise<boolean> {
    try {
      const userEvents = await this.getUserEvents(userId);
      return userEvents.some(event => event.id === eventId);
    } catch (error) {
      console.error('Error checking participation status:', error);
      return false;
    }
  }

  async getEventParticipants(eventId: number): Promise<Participant[]> {
    try {
      const response = await apiClient.get(`/participants/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    try {
      const response = await apiClient.get(`/participants/user/${userId}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }

  async updateParticipantStatus(
    userId: number,
    eventId: number,
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  ): Promise<Participant> {
    try {
      const response = await apiClient.put('/participants/status', null, {
        params: {
          userId: Number(userId),
          eventId: Number(eventId),
          status: status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating participant status:', error);
      throw error;
    }
  }
}

export default new ParticipantService();