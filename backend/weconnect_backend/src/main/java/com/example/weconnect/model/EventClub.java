package com.example.weconnect.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.weconnect.enums.Status;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "nb_participants")
    private int nbParticipants = 0;

    private Long createurId;

    // Juste l'ID du club (le vrai Club est dans un autre service)
    @Column(name = "club_id")
    private Long clubId;

    @Column(length = 1024)
    private String image; // URL ou chemin de l'image de l'événement

    @OneToMany(mappedBy = "eventClub", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ParticipantClub> participantsClub = new ArrayList<>();
}
