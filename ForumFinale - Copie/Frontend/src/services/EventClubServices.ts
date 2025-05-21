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