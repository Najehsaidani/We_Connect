package com.User.Useverification.Model.entity;


import jakarta.persistence.*;
import lombok.*;


import java.util.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Table(name="user")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder

public class User implements UserDetails {
    public enum Status {
        ACTIF, SUSPENDU, BLOQUE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Date dateOfBirth;
    private String address;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    
    private String departement;
    private String biographie;
    @Column(length = 1024)
    private String image;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIF;

    @ManyToMany(cascade = CascadeType.MERGE, fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles", 
               joinColumns = @JoinColumn(name = "user_id"),
               inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public void setSingleRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        } else {
            this.roles.clear();
        }
        this.roles.add(role);
    }
    private Long createdTimestamp;
    private boolean enabled;
    private String verificationCode;
    private Date verificationCodeExpiration;
    private String resetPasswordToken;
    private Date resetPasswordTokenExpiration;

  

  
    public String getUsername() {
        return email;
    }

 
    public boolean isAccountNonExpired() {
        return status != Status.SUSPENDU;
    }

    
    public boolean isAccountNonLocked() {
        return status != Status.BLOQUE;
    }

   
   

  
    public boolean isEnabled() {
        return enabled && status == Status.ACTIF;
    }

    public boolean isCompteEnable() {
        return enabled;}
    public Boolean isSuspendu() {
        return status == Status.SUSPENDU;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
            Set<SimpleGrantedAuthority> authorities = new HashSet<>();
            for (Role role : roles) {
                authorities.add(new SimpleGrantedAuthority(role.getName()));
            }
            return authorities;
    }

    
}