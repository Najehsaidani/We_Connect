package com.User.Useverification.Request;

import lombok.*;

@Builder
@Getter
@Setter

public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmationPassword;
         
}
