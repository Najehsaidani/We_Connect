// src/services/userActivityService.ts
import apiClient from './api';

export interface UserActivity {
  id: number;
  userId: number;
  activityType: 'POST' | 'POST_LIKE' | 'COMMENT' | 'COMMENT_LIKE';
  targetId: number;
  content?: string;
  createdAt: string;
  targetTitle: string;
  postId?: number;
}

export const userActivityService = {
  getUserActivities: async (userId: number): Promise<UserActivity[]> => {
    try {
      // Utiliser l'API gateway pour accéder au service
      const response = await apiClient.get(`/user-activities/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch user activities');
    }
  }
};

export default userActivityService;
