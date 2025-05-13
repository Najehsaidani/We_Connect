package com.User.Useverification.Model.DTO;

import java.util.Date;

import com.User.Useverification.Model.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Date dateOfBirth;
    private String phoneNumber;
    private String address;
    private String departement;
    private String biographie;

   
  

    // getters and setters

    // ...existing code...

    public static UserDto toDTO(User user){
        return UserDto.builder()
            .id(user.getId())
           
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .password(user.getPassword())
            .dateOfBirth(user.getDateOfBirth())
            .phoneNumber(user.getPhoneNumber())
            .address(user.getAddress())
            .departement(user.getDepartement())
            .biographie(user.getBiographie())

            .build();
    }

    

// ...existing code...
}

