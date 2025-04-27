package com.User.Useverification.Model.DTO;

import java.util.Date;

import com.User.Useverification.Model.entity.User;
import com.User.Useverification.enums.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserDto {
    private Long id;
    private String numCin ;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Date dateOfBirth;
    private String phoneNumber;
    private String address;
     private String departement;
    private String domaine;
   
    @Enumerated(EnumType.STRING)
    private Role role;
    // getters and setters

    // ...existing code...

    public static UserDto toDTO(User user){
        return UserDto.builder()
            .id(user.getId())
            .numCin(user.getNumCin())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .password(user.getPassword())
            .dateOfBirth(user.getDateOfBirth())
            .phoneNumber(user.getPhoneNumber())
            .address(user.getAddress())
            .departement(user.getDepartement())
            .domaine(user.getDomaine())
            .role(user.getRole())
            .build();
    }

    

// ...existing code...
}

