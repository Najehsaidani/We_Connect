package com.iset.clubservice.model.dto;

import com.iset.clubservice.model.enums.EtatClub;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubSummaryDto {
    private Long id;
    private String nom;
    private String description;
    private LocalDate dateCreation;
    private EtatClub etat;
    private int members;
    private String banner;
}
