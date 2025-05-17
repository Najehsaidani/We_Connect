import apiClient from '../services/api';

// Define the EventClub interface
export interface EventClub {
  id?: number;
  name: string;
  description: string;
  date: string;
  createurId: number;
}

// Export the service object
export const EventsService = {
  // Get all events
  getAllEvents: async (): Promise<EventClub[]> => {
    try {
      const res = await apiClient.get('/events');
      return res.data;
    } catch (error) {
      throw new Error('Failed to fetch events');
    }
  },

  // Search events
  searchEvents: async (searchTerm: string): Promise<EventClub[]> => {
    try {
      const res = await apiClient.get('/events/search', {
        params: { search: searchTerm },
      });
      return res.data;
    } catch (error) {
      throw new Error('Failed to search events');
    }
  },

  // Create an event
  createEvent: async (
    createurId: number,
    event: Omit<EventClub, 'id' | 'createurId'>
  ): Promise<EventClub> => {
    try {
      const res = await apiClient.post(`/events`, { ...event, createurId });
      return res.data;
    } catch (error) {
      throw new Error('Failed to create event');
    }
  },

  // Update an event
  updateEvent: async (
    id: number,
    updates: Partial<Omit<EventClub, 'id' | 'createurId'>>
  ): Promise<EventClub> => {
    try {
      const res = await apiClient.put(`/events/${id}`, updates);
      return res.data;
    } catch (error) {
      throw new Error('Failed to update event');
    }
  },

  // Delete an event
  deleteEvent: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch (error) {
      throw new Error('Failed to delete event');
    }
  },
};