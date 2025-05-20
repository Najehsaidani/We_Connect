package com.User.Useverification.Model.DTO;

import java.util.Date;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class ProfileUpdateDTO {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String biographie;
    private String departement;
    private Date dateOfBirth;
    
    // Getters and setters
}