package com.User.Useverification.Request;

import lombok.*;

@Builder
@Getter
@Setter

public class VerifRequest {
    private String email;
    private String verificationCode;
    
}
