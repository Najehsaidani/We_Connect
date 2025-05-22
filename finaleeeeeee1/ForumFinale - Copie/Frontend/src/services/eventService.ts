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
      console.log('Creating event with createurId:', createurId);
      console.log('JSON stringified data:', JSON.stringify(eventData));

      // Make sure we're sending a proper JSON object, not a string
      // Pass createurId as a request parameter
      // Ensure all fields are properly defined and not null/undefined
      const cleanedEventData = {
        titre: eventData.titre || "",
        description: eventData.description || "",
        lieu: eventData.lieu || "",
        dateDebut: eventData.dateDebut || new Date().toISOString(),
        dateFin: eventData.dateFin || new Date(new Date().getTime() + 3600000).toISOString(),
        status: eventData.status || "AVENIR"
      };

      console.log("Cleaned event data:", cleanedEventData);
      console.log("JSON stringified data:", JSON.stringify(cleanedEventData));

      const res = await apiClient.post(`/events/create?createurId=${createurId}`, cleanedEventData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Create event response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
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