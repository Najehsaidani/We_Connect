package com.iset.clubservice.model.dto;

import lombok.*;

import java.time.LocalDate;

import com.iset.clubservice.model.enums.EtatClub;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubDto {
    private Long id;
    private String nom;
    private String description;
    private LocalDate dateCreation;
    private Long createurId;
    private Long categoryId; // Keep for backward compatibility
    private CategorySummaryDto category; // Add the category object
    private EtatClub etat;
    private int members;  // Le nombre de membres
    private String banner; // URL ou chemin de la bannière
    private String profilePhoto;
}
