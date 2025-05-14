package com.iset.clubservice.model.dto;

import com.iset.clubservice.model.enums.RoleMembre;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MembreClubDto {
    private Long id;        // ID du membre dans le club
    private Long userId;    // ID de l'utilisateur (étudiant)
    private Long clubId;    // ID du club auquel le membre appartient
    private RoleMembre role; // Rôle du membre dans le club
}
