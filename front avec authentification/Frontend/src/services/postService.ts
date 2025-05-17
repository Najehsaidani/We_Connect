import apiClient from '../services/api';


// Types
export interface PostRequest {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}

export interface PostResponse {
  id: number;
  title: string;
  author:string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadResponse {
  url: string;
}

// Exported service object
export const PostsService = {
  // Create a new post
  createPost: async (post: PostRequest): Promise<PostResponse> => {
    try {
      const res = await apiClient.post('/posts', post);
    
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create post';
    
      throw new Error(message);
    }
  },

  // Update existing post
  updatePost: async (id: number, post: Partial<PostRequest>): Promise<PostResponse> => {
    try {
      const res = await apiClient.put(`/posts/${id}`, post);
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update post';
    
      throw new Error(message);
    }
  },

  // Get all posts
  getAllPosts: async (): Promise<PostResponse[]> => {
    try {
      const res = await apiClient.get('/posts');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch posts';
    
      throw new Error(message);
    }
  },

  // Get posts by category
  getPostsByCategory: async (category: string): Promise<PostResponse[]> => {
    try {
      const res = await apiClient.get(`/posts/category/${encodeURIComponent(category)}`);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || `Failed to fetch posts for category: ${category}`;
    
      throw new Error(message);
    }
  },

  // Search posts
  searchPosts: async (query: string): Promise<PostResponse[]> => {
    try {
      const res = await apiClient.get('/posts/search', {
        params: { query },
      });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || `Failed to search posts: ${query}`;
    
      throw new Error(message);
    }
  },

  // Delete post
  deletePost: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/posts/${id}`);
     
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
    
      throw new Error(message);
    }
  },

  // Upload image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload image';
    
      throw new Error(message);
    }
  },
};