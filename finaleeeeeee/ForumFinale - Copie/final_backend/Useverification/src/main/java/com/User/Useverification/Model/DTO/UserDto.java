package com.User.Useverification.Model.DTO;

import java.util.Date;

import com.User.Useverification.Model.entity.User;
import com.User.Useverification.enums.Status;

import lombok.*;
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
    private Status status;
    private String clubName; // Ajouté pour correspondre au DTO du service de clubs




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
            .status(user.getStatus())
            .clubName("") // Valeur par défaut pour le champ clubName
            .build();
    }



// ...existing code...
}

