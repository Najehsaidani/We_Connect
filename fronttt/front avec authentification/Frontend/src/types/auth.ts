// src/types/auth.ts
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface VerifRequest {
    email: string;
    verificationCode: string;
  }
  
  export interface ResetRequest {
    email: string;
    resetPasswordToken: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    confirmPassword: string;
  }

export interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}
