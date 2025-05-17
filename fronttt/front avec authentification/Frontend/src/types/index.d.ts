
// Type definitions for the forum application

export interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'student' | 'professor';
  coverImage?: string;
}

export interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  category: string;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  postId: number;
}

export interface Notification {
  id: number;
  type: 'message' | 'like' | 'comment' | 'friend' | 'event' | 'photo';
  sender: string;
  avatar: string;
  content: string;
  time: string;
  read: boolean;
}

export interface Friend {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  department: string;
  coverImage?: string;
}

export interface FriendRequest {
  id: number;
  name: string;
  avatar: string;
  department: string;
}

export interface Category {
  name: string;
  icon: React.ReactNode;
}

export interface Club {
  id: number;
  name: string;
  description: string;
  members: number;
  category: string;
  avatar?: string;
  coverImage?: string;
  createdAt: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  attendees: number;
  image?: string;
  coverImage?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
}

export interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'group';
  lastMessage: string;
  timestamp: string;
  unread: number;
  members?: number;
  isBlocked?: boolean;
}
