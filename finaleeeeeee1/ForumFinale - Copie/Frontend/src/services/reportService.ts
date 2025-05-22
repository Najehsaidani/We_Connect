// src/services/reportService.ts
import apiClient from './api';

// Types
export interface ReportRequest {
  postId: number;
  userId: number;
  reason: string;
}

export interface ReportResponse {
  id: number;
  reason: string;
  status: string;
  userId: number;
  username?: string;
  userAvatar?: string;
  postId: number;
  postContent?: string;
  postAuthor?: string;
  postAuthorAvatar?: string;
  postImageUrl?: string;
  createdAt: string;
  reportedBy?: string;
  post?: {
    id: number;
    content: string;
    author?: string;
    createdAt: string;
    image?: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
  };
}

// Exported service object
export const ReportService = {
  // Create a new report
  createReport: async (report: ReportRequest): Promise<ReportResponse> => {
    try {
      const res = await apiClient.post('/reports', report);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create report';
      throw new Error(message);
    }
  },

  // Get all pending reports
  getPendingReports: async (): Promise<ReportResponse[]> => {
    try {
      const res = await apiClient.get('/reports/pending');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch pending reports';
      throw new Error(message);
    }
  },

  // Get all reports (for admin) - using the simplified endpoint
  getAllReports: async (): Promise<ReportResponse[]> => {
    try {
      console.log("Using simplified endpoint for reports...");

      // Utiliser l'endpoint simplifié qui renvoie des DTO
      try {
        const res = await apiClient.get('/reports/pending-simple');
        console.log("Response from simplified endpoint:", res.data);

        if (Array.isArray(res.data)) {
          return res.data;
        } else if (res.data && typeof res.data === 'object') {
          if (res.data.data && Array.isArray(res.data.data)) {
            return res.data.data;
          } else if (res.data.id) {
            return [res.data];
          }
        }

        return [];
      } catch (apiError) {
        console.error("Error using simplified endpoint:", apiError);
        console.log("Falling back to direct fetch with simplified endpoint...");
      }

      // Méthode alternative : utiliser fetch directement avec l'endpoint simplifié
      try {
        const rawResponse = await fetch('http://localhost:8082/api/reports/pending-simple');
        const text = await rawResponse.text();

        try {
          const data = JSON.parse(text);
          console.log("Successfully parsed JSON from simplified endpoint:", data);

          if (Array.isArray(data)) {
            return data;
          } else if (data && typeof data === 'object') {
            if (data.data && Array.isArray(data.data)) {
              return data.data;
            } else if (data.id) {
              return [data];
            }
          }
        } catch (jsonError) {
          console.error("Invalid JSON response from simplified endpoint:", jsonError);
          console.log("Raw response text (first 500 chars):", text.substring(0, 500));
        }
      } catch (fetchError) {
        console.error("Error with direct fetch to simplified endpoint:", fetchError);
      }

      // Si tout échoue, retourner un tableau vide
      return [];
    } catch (error) {
      console.error("Error in getAllReports:", error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  },

  // Get reports by post ID
  getReportsByPostId: async (postId: number): Promise<ReportResponse[]> => {
    try {
      const res = await apiClient.get(`/reports/post/${postId}`);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || `Failed to fetch reports for post: ${postId}`;
      throw new Error(message);
    }
  },

  // Update report status
  updateReportStatus: async (reportId: number, status: string): Promise<ReportResponse> => {
    try {
      const res = await apiClient.put(`/reports/${reportId}/status`, { status });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update report status';
      throw new Error(message);
    }
  },

  // Approve a report (mark as handled) - using the status update endpoint
  approveReport: async (reportId: number): Promise<ReportResponse | null> => {
    try {
      const res = await apiClient.put(`/reports/${reportId}/status`, { status: 'RESOLVED' });

      // Handle different response formats
      if (res.data) {
        return res.data;
      }

      return null;
    } catch (error) {
      console.error(`Error approving report ${reportId}:`, error);
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  },

  // Delete a report
  deleteReport: async (reportId: number): Promise<void> => {
    try {
      await apiClient.delete(`/reports/${reportId}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete report';
      throw new Error(message);
    }
  }
};
