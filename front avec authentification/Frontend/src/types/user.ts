// src/types/user.ts
export interface UserDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
  }
  
// src/types/user.ts
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  departement: string;
  biographie: string;
  image?: string; // Base64-encoded image from backend
};
  export interface StatusUpdateRequest {
    status: string;
  }
  
  export interface RoleAssignmentRequest {
    role: string;
  }