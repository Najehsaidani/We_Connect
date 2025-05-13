package com.User.Useverification.Request;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String email;
    private String currentPassword; // Changed to camelCase
    private String newPassword;     // Changed to camelCase
    private String confirmationPassword; // Changed to camelCase
}
