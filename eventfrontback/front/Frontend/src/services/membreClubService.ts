// src/services/membreClubService.ts
import apiClient from './api';

export enum RoleMembre {
  ADMIN_CLUB = 'ADMIN_CLUB',
  MEMBRE = 'MEMBRE'
}

export interface MembreClub {
  id?: number;
  userId: number;
  role: RoleMembre;
  club?: {
    id: number;
    nom: string;
    description?: string;
    dateCreation?: string;
    createurId?: number;
    etat?: string;
    category?: {
      id: number;
      nom: string;
    };
    image?: string;
    banner?: string;
  };
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

class MembreClubService {
  /**
   * Get all members of a club
   * @param clubId - The ID of the club
   * @returns Promise with array of club members
   */
  /**
   * Get user details by ID
   * @param userId - The ID of the user
   * @returns Promise with user details
   */
  private async getUserDetails(userId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get all members of a club
   * @param clubId - The ID of the club
   * @returns Promise with array of club members
   */
  async getClubMembers(clubId: number): Promise<MembreClub[]> {
    try {
      console.log(`Fetching members for club ${clubId}`);
      const response = await apiClient.get(`/clubs/${clubId}/membres`);
      console.log(`Found ${response.data.length} members for club ${clubId}`);

      // Process the response data to ensure it matches our interface
      const members: MembreClub[] = response.data.map(member => {
        // Make sure we have the correct structure
        return {
          id: member.id,
          userId: member.userId,
          role: member.role || RoleMembre.MEMBRE, // Default to MEMBRE if role is not provided
          club: member.club,
          // Extract user information if available
          firstName: member.user?.firstName || '',
          lastName: member.user?.lastName || '',
          email: member.user?.email || '',
          user: member.user
        };
      });

      // Try to fetch additional user details for members that don't have complete user info
      const membersWithUserDetails = await Promise.all(
        members.map(async (member) => {
          // If we already have complete user info, return as is
          if (member.user && member.user.firstName && member.user.lastName && member.user.email) {
            return member;
          }

          // Otherwise, try to fetch user details
          try {
            const userDetails = await this.getUserDetails(member.userId);
            if (userDetails) {
              return {
                ...member,
                firstName: userDetails.firstName || member.firstName,
                lastName: userDetails.lastName || member.lastName,
                email: userDetails.email || member.email,
                user: {
                  ...member.user,
                  id: userDetails.id || member.userId,
                  firstName: userDetails.firstName || member.firstName,
                  lastName: userDetails.lastName || member.lastName,
                  email: userDetails.email || member.email,
                  image: userDetails.image || member.user?.image,
                  departement: userDetails.departement || member.user?.departement
                }
              };
            }
          } catch (error) {
            console.error(`Error enhancing user details for member ${member.id}:`, error);
          }

          // Return original member if we couldn't fetch additional details
          return member;
        })
      );

      console.log('Processed club members with user details:', membersWithUserDetails);
      return membersWithUserDetails;
    } catch (error) {
      console.error('Error fetching club members:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // In development mode, return empty array
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning empty array for club members');
        return [];
      }
      throw error;
    }
  }

  /**
   * Add a member to a club
   * @param clubId - The ID of the club
   * @param userId - The ID of the user to add
   * @param role - The role of the member (ADMIN_CLUB or MEMBRE)
   * @returns Promise with the new member data
   */
  async addMember(clubId: number, userId: number, role: RoleMembre): Promise<MembreClub> {
    try {
      console.log(`Adding member to club: clubId=${clubId}, userId=${userId}, role=${role}`);
      const response = await apiClient.post(`/clubs/${clubId}/membres`, {
        userId: Number(userId),
        role: role
      });
      console.log('Add member response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding club member:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw error;
    }
  }

  /**
   * Remove a member from a club
   * @param clubId - The ID of the club
   * @param membreId - The ID of the member to remove
   * @returns Promise with void response
   */
  async removeMember(clubId: number, membreId: number): Promise<void> {
    try {
      console.log(`Removing member from club: clubId=${clubId}, membreId=${membreId}`);
      await apiClient.delete(`/clubs/${clubId}/membres/${membreId}`);
      console.log(`Member ${membreId} removed from club ${clubId} successfully`);
    } catch (error) {
      console.error('Error removing club member:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw error;
    }
  }

  /**
   * Update a member's role in a club
   * @param clubId - The ID of the club
   * @param membreId - The ID of the member
   * @param role - The new role (ADMIN_CLUB or MEMBRE)
   * @returns Promise with the updated member data
   */
  async updateMemberRole(clubId: number, membreId: number, role: RoleMembre): Promise<MembreClub> {
    try {
      console.log(`Updating member role: clubId=${clubId}, membreId=${membreId}, role=${role}`);
      const response = await apiClient.put(`/clubs/${clubId}/membres/${membreId}/role`, {
        role: role
      });
      console.log('Update member role response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating club member role:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw error;
    }
  }
}

export default new MembreClubService();
