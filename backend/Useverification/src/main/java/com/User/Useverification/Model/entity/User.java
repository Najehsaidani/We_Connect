package com.User.Useverification.Model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.enums.Role;




@Table(name="user")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
@Setter

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numCin;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Date dateOfBirth;
    private String address;
    private String email;
    private String password;
    private Long createdTimestamp;
    private String departement;
    private String domaine;
   
    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean enable;
    private String verificationCode;
    private Date verificationCodeExpiration;
    private String restPasswordToken;
    private Date resetPasswordTokenExpiration;

    // ...existing code...

    

// ...existing code...
}
