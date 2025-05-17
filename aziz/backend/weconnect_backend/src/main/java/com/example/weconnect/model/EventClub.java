package com.example.weconnect.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventClub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String nomClub;
    private String image;
    private String status;

    @Column(name = "nb_participants")
    private int nbParticipants = 0;

    private Long createurId;

    // Juste l'ID du club (le vrai Club est dans un autre service)
    @Column(name = "club_id")
    private Long clubId;
}
