package com.iset.clubservice.model.entity;

import com.iset.clubservice.model.enums.RoleMembre;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "membre_club")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // ID de l'étudiant

    @Enumerated(EnumType.STRING)
    private RoleMembre role;

    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;
}
