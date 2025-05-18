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
  clubId?: number;
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
  getEventParticipants: async (id: number): Promise<any[]> => {
    try {
      console.log(`Fetching participants for event ${id}`);
      const res = await apiClient.get(`/events/${id}/participants`);
      console.log('Event participants response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }
  }
};