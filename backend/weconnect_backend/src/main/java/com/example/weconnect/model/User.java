// package com.example.weconnect.model;

// import com.fasterxml.jackson.annotation.JsonIgnore;
// import jakarta.persistence.*;
// import java.util.Set;

// @Entity
// @Table(name = "user")
// public class User {
//     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     private String email;
//     private String firstName;
//     private String lastName;
//     private String password;
//     private boolean enabled;
//     private String clubName; // nom du club, si membre

//     @ManyToMany(fetch = FetchType.EAGER)
//     @JoinTable(name = "users_roles",
//       joinColumns = @JoinColumn(name = "user_id"),
//       inverseJoinColumns = @JoinColumn(name = "role_id"))
//     @JsonIgnore
//     private Set<Role> roles;

//     // @OneToMany(mappedBy = "createur") 
//     // @JsonIgnore 
//     // private Set<EventClub> events;

//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public String getEmail() { return email; }
//     public void setEmail(String email) { this.email = email; }
//     public String getFirstName() { return firstName; }
//     public void setFirstName(String firstName) { this.firstName = firstName; }
//     public String getLastName() { return lastName; }
//     public void setLastName(String lastName) { this.lastName = lastName; }
//     public String getPassword() { return password; }
//     public void setPassword(String password) { this.password = password; }
//     public boolean isEnabled() { return enabled; }
//     public void setEnabled(boolean enabled) { this.enabled = enabled; }
//     public String getClubName() { return clubName; }
//     public void setClubName(String clubName) { this.clubName = clubName; }
//     public Set<Role> getRoles() { return roles; }
//     public void setRoles(Set<Role> roles) { this.roles = roles; }
//     // public Set<EventClub> getEvents() { return events; }
//     // public void setEvents(Set<EventClub> events) { this.events = events; }
// }
