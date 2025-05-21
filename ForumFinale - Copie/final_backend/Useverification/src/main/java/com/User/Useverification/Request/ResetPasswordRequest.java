package com.User.Useverification.Request;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String newPassword;
    private String confirmationPassword;

    
}
