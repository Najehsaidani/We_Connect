package com.iset.clubservice.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

import com.iset.clubservice.model.enums.EtatClub;

@Entity
@Table(name = "club")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String description;

    private LocalDate dateCreation;
    private Long createurId; // ID de l'étudiant créateur

    @Column(name = "etat")
     private EtatClub etat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference
    private Category category;

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembreClub> membres;

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Publication> publications;

    private String banner; // URL ou chemin de l'image de la bannière

    @Column(length = 1024)
    private String image; // URL ou chemin de l'image principale du club
}
