package com.User.Useverification.Request;

import lombok.*;

@Builder
@Getter
@Setter

public class LoginRequest {
    private String email;
    private String password;
    
}
