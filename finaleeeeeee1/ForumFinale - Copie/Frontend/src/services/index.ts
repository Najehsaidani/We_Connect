// src/services/index.ts
// Export all services from a single file for easier imports

// Auth Service
export { authService } from './authService';

// User Service
export { userService } from './userService';
export { default as userActivityService } from './userActivityService';

// Role Service
export { roleService } from './roleService';

// Club Service
export { clubService } from './clubService';

// Category Service
export { categoryService } from './categoryService';

// Event Services
export { EventsService } from './eventService';
export { eventsClubsService } from './EventClubServices';

// Participant Services
export { default as participantService } from './participantService';
export { default as participantClubService } from './participantClubService';

// Post Service
export { PostsService } from './postService';

// API Client
export { default as apiClient } from './api';
