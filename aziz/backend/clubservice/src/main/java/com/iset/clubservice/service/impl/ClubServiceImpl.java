package com.iset.clubservice.service.impl;

import com.iset.clubservice.model.dto.ClubDto;
import com.iset.clubservice.model.dto.MembreClubDto;
import com.iset.clubservice.model.entity.Category;
import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.model.entity.MembreClub;
import com.iset.clubservice.model.enums.EtatClub;
import com.iset.clubservice.model.enums.RoleMembre;
import com.iset.clubservice.repository.CategoryRepository;
import com.iset.clubservice.repository.ClubRepository;
import com.iset.clubservice.repository.MembreClubRepository;
import com.iset.clubservice.service.ClubService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ClubServiceImpl implements ClubService {

    private static final Logger log = LoggerFactory.getLogger(ClubServiceImpl.class);

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MembreClubRepository membreClubRepository;

    @Override
    public ClubDto createClub(ClubDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée"));

        Club club = Club.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .dateCreation(dto.getDateCreation())
                .createurId(dto.getCreateurId())
                .category(category)
                .etat(EtatClub.EN_ATTENTE)
                .build();

        club = clubRepository.save(club);

        // Ajouter le créateur comme ADMIN
        MembreClub membre = MembreClub.builder()
                .userId(dto.getCreateurId())
                .role(RoleMembre.ADMIN_CLUB)
                .club(club)
                .build();
        membreClubRepository.save(membre);

        return toDto(club);
    }

    @Override
    public ClubDto updateClub(Long id, ClubDto dto) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));

        club.setNom(dto.getNom());
        club.setDescription(dto.getDescription());
        club.setCategory(categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée")));

        return toDto(clubRepository.save(club));
    }

    @Override
    public void deleteClub(Long id) {
        clubRepository.deleteById(id);
    }

    @Override
    public List<ClubDto> getAllClubs() {
        return clubRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ClubDto getClubById(Long id) {
        return clubRepository.findById(id).map(this::toDto).orElse(null);
    }

    private ClubDto toDto(Club c) {
        int membersCount = c.getMembres() != null ? c.getMembres().size() : 0;

        return ClubDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .dateCreation(c.getDateCreation())
                .createurId(c.getCreateurId())
                .categoryId(c.getCategory().getId())
                .etat(c.getEtat())
                .members(membersCount)
                .banner(c.getBanner())
                .profilePhoto(null) // ou une valeur par défaut
                .build();
    }

    private MembreClubDto toDto(MembreClub membre) {
        return MembreClubDto.builder()
                .id(membre.getId())
                .userId(membre.getUserId())
                .clubId(membre.getClub().getId())
                .role(membre.getRole())
                .build();
    }

    @Override
    public MembreClubDto inscrireEtudiantAuClub(Long clubId, Long userId) {
        if (membreClubRepository.existsByClubIdAndUserId(clubId, userId)) {
            throw new IllegalArgumentException("L'étudiant est déjà membre de ce club.");
        }

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club non trouvé."));

        MembreClub membre = MembreClub.builder()
                .userId(userId)
                .club(club)
                .role(RoleMembre.MEMBRE)
                .build();

        membre = membreClubRepository.save(membre);
        log.info("L'étudiant {} s'est inscrit au club {}", userId, clubId);

        return toDto(membre);
    }

    @Override
    public ClubDto quitterClub(Long clubId, Long userId) {
        MembreClub membre = membreClubRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("L'utilisateur n'est pas inscrit dans ce club"));

        membreClubRepository.delete(membre);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));

        return toDto(club);
    }

    @Override
    public MembreClubDto supprimerMembreDuClub(Long clubId, Long membreASupprimerId, Long adminId) {
        MembreClub admin = membreClubRepository.findByClubIdAndUserId(clubId, adminId)
                .orElseThrow(() -> new IllegalArgumentException("Vous n'êtes pas membre de ce club."));

        if (admin.getRole() != RoleMembre.ADMIN_CLUB) {
            throw new IllegalArgumentException("Seul un ADMIN_CLUB peut supprimer un membre.");
        }

        if (adminId.equals(membreASupprimerId)) {
            throw new IllegalArgumentException("Un ADMIN_CLUB ne peut pas se supprimer lui-même.");
        }

        MembreClub membre = membreClubRepository.findByClubIdAndUserId(clubId, membreASupprimerId)
                .orElseThrow(() -> new IllegalArgumentException("Ce membre n'existe pas dans le club."));

        membreClubRepository.delete(membre);
        log.warn("ADMIN {} a supprimé le membre {} du club {}", adminId, membreASupprimerId, clubId);

        return toDto(membre);
    }

    @Override
    public ClubDto accepterClub(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));
        club.setEtat(EtatClub.ACCEPTER);
        return toDto(clubRepository.save(club));
    }

    @Override
    public ClubDto refuserClub(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));
        club.setEtat(EtatClub.REFUSER);
        return toDto(clubRepository.save(club));
    }

    @Override
    public List<ClubDto> getClubsEnAttente() {
        return clubRepository.findByEtat(EtatClub.EN_ATTENTE)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Club> searchClubs(String search, String category) {
        EtatClub etat = EtatClub.ACCEPTER;
        if (category != null && !category.isBlank()) {
            return clubRepository.findByEtatAndNomContainingIgnoreCaseAndCategory_NomIgnoreCase(etat, search, category);
        } else {
            return clubRepository.findByEtatAndNomContainingIgnoreCase(etat, search);
        }
    }
}
