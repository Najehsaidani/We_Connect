import apiClient from './api';
import { EventClub } from './EventClubServices';

export interface ParticipantClub {
  id?: number;
  userId: number;
  eventClub: EventClub;
  eventClubId?: number;
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

class ParticipantClubService {
  async joinEvent(userId: number, eventClubId: number): Promise<ParticipantClub> {
    try {
      const response = await apiClient.post('/participantsClub/join', null, {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId)
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error joining club event:', error);
      throw error;
    }
  }

  async leaveEvent(userId: number, eventClubId: number): Promise<void> {
    try {
      await apiClient.delete('/participantsClub/leave', {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId)
        },
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error leaving club event:', error);
      throw error;
    }
  }

  async isParticipating(userId: number, eventClubId: number): Promise<boolean> {
    try {
      const userEvents = await this.getUserEvents(userId);
      return userEvents.some(event => event.id === eventClubId);
    } catch (error) {
      console.error('Error checking participation status:', error);
      return false;
    }
  }

  async getEventParticipants(eventClubId: number): Promise<ParticipantClub[]> {
    try {
      const response = await apiClient.get(`/participantsClub/eventClub/${Number(eventClubId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching club event participants:', error);
      return [];
    }
  }

  async getUserEvents(userId: number): Promise<EventClub[]> {
    try {
      const response = await apiClient.get(`/participantsClub/user/${Number(userId)}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user club events:', error);
      return [];
    }
  }

  async updateParticipantStatus(
    userId: number, 
    eventClubId: number, 
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  ): Promise<ParticipantClub> {
    try {
      const response = await apiClient.put('/participantsClub/status', null, {
        params: {
          userId: Number(userId),
          eventClubId: Number(eventClubId),
          status: status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating club participant status:', error);
      throw error;
    }
  }
}

export default new ParticipantClubService();