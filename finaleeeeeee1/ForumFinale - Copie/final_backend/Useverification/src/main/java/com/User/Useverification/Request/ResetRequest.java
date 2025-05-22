package com.User.Useverification.Request;

import lombok.*;

@Builder
@Getter
@Setter

public class ResetRequest {
    private String email;
    private String resetPasswordToken;
    
}
