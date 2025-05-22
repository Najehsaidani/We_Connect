package com.iset.clubservice.service.impl;

import com.iset.clubservice.client.UserClient;
import com.iset.clubservice.model.dto.CategorySummaryDto;
import com.iset.clubservice.model.dto.ClubDto;
import com.iset.clubservice.model.dto.MembreClubDto;
import com.iset.clubservice.model.dto.UserDTO;
import com.iset.clubservice.model.entity.Category;
import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.model.entity.MembreClub;
import com.iset.clubservice.model.enums.EtatClub;
import com.iset.clubservice.model.enums.RoleMembre;
import com.iset.clubservice.repository.CategoryRepository;
import com.iset.clubservice.repository.ClubRepository;
import com.iset.clubservice.repository.MembreClubRepository;
import com.iset.clubservice.service.ClubService;

import lombok.AllArgsConstructor;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@AllArgsConstructor
public class ClubServiceImpl implements ClubService {

    private static final Logger log = LoggerFactory.getLogger(ClubServiceImpl.class);


    private ClubRepository clubRepository;


    private CategoryRepository categoryRepository;


    private MembreClubRepository membreClubRepository;


    private UserClient userClient;

    @Override
    public ClubDto createClub(ClubDto dto) {
        try {
            // Vérifier si le créateur existe
            UserDTO createur;
            try {
                createur = userClient.getUserById(dto.getCreateurId());
                if (createur == null) {
                    log.error("Créateur avec ID {} non trouvé", dto.getCreateurId());
                    throw new IllegalArgumentException("Le créateur n'existe pas.");
                }
            } catch (Exception e) {
                log.error("Erreur lors de la récupération du créateur avec ID {}: {}", dto.getCreateurId(), e.getMessage());
                throw new IllegalArgumentException("Erreur lors de la vérification du créateur: " + e.getMessage());
            }

            // Vérifier si la catégorie existe
            Category category;
            try {
                category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée"));
            } catch (Exception e) {
                log.error("Erreur lors de la récupération de la catégorie avec ID {}: {}", dto.getCategoryId(), e.getMessage());
                throw new IllegalArgumentException("Erreur lors de la vérification de la catégorie: " + e.getMessage());
            }

            // Créer le club
            Club club = Club.builder()
                    .nom(dto.getNom())
                    .description(dto.getDescription())
                    .dateCreation(dto.getDateCreation())
                    .createurId(dto.getCreateurId())
                    .category(category)
                    .etat(EtatClub.EN_ATTENTE)
                    .build();

            try {
                club = clubRepository.save(club);
            } catch (Exception e) {
                log.error("Erreur lors de la sauvegarde du club: {}", e.getMessage());
                throw new RuntimeException("Erreur lors de la création du club: " + e.getMessage());
            }

            // Ajouter le créateur comme ADMIN
            try {
                MembreClub membre = MembreClub.builder()
                        .userId(dto.getCreateurId())
                        .role(RoleMembre.ADMIN_CLUB)
                        .club(club)
                        .build();
                membreClubRepository.save(membre);
            } catch (Exception e) {
                log.error("Erreur lors de l'ajout du créateur comme admin: {}", e.getMessage());
                // Si l'ajout du membre échoue, on supprime le club pour éviter un club sans admin
                clubRepository.delete(club);
                throw new RuntimeException("Erreur lors de l'ajout du créateur comme admin: " + e.getMessage());
            }

            log.info("Club créé par {} ({} {})",
                    dto.getCreateurId(), createur.getFirstName(), createur.getLastName());

            return toDto(club);
        } catch (Exception e) {
            log.error("Erreur lors de la création du club: {}", e.getMessage());
            throw e;
        }
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

        // Create CategorySummaryDto
        CategorySummaryDto categorySummary = null;
        if (c.getCategory() != null) {
            categorySummary = CategorySummaryDto.builder()
                    .id(c.getCategory().getId())
                    .nom(c.getCategory().getNom())
                    .build();
        }

        return ClubDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .dateCreation(c.getDateCreation())
                .createurId(c.getCreateurId())
                .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
                .category(categorySummary)
                .etat(c.getEtat())
                .members(membersCount)
                .banner(c.getBanner())
                .profilePhoto(null) // ou une valeur par défaut
                .image(c.getImage()) // Ajout de l'image
                .build();
    }

    private MembreClubDto toDto(MembreClub membre) {
        // Récupérer les informations de l'utilisateur via FeignClient
        UserDTO user = null;
        try {
            user = userClient.getUserById(membre.getUserId());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'utilisateur avec ID {}: {}", membre.getUserId(), e.getMessage());
            // Continuer avec user = null, les informations de base seront utilisées
        }

        MembreClubDto.MembreClubDtoBuilder builder = MembreClubDto.builder()
                .id(membre.getId())
                .userId(membre.getUserId())
                .clubId(membre.getClub().getId())
                .role(membre.getRole());

        // Ajouter les informations de l'utilisateur si disponibles
        if (user != null) {
            builder.firstName(user.getFirstName())
                   .lastName(user.getLastName())
                   .email(user.getEmail());
        } else {
            // Valeurs par défaut si l'utilisateur n'est pas disponible
            builder.firstName("Utilisateur")
                   .lastName("#" + membre.getUserId())
                   .email("utilisateur" + membre.getUserId() + "@exemple.com");
        }

        return builder.build();
    }

    @Override
    public MembreClubDto inscrireEtudiantAuClub(Long clubId, Long userId) {
        try {
            // Vérifier si l'utilisateur existe via le service UserClient
            UserDTO user;
            try {
                user = userClient.getUserById(userId);
                if (user == null) {
                    log.error("Utilisateur avec ID {} non trouvé", userId);
                    throw new IllegalArgumentException("L'utilisateur n'existe pas.");
                }
            } catch (Exception e) {
                log.error("Erreur lors de la récupération de l'utilisateur avec ID {}: {}", userId, e.getMessage());
                throw new IllegalArgumentException("Erreur lors de la vérification de l'utilisateur: " + e.getMessage());
            }

            // Vérifier si l'utilisateur est déjà membre du club
            if (membreClubRepository.existsByClubIdAndUserId(clubId, userId)) {
                throw new IllegalArgumentException("L'étudiant est déjà membre de ce club.");
            }

            // Récupérer le club
            Club club;
            try {
                club = clubRepository.findById(clubId)
                        .orElseThrow(() -> new IllegalArgumentException("Club non trouvé."));
            } catch (Exception e) {
                log.error("Erreur lors de la récupération du club avec ID {}: {}", clubId, e.getMessage());
                throw new IllegalArgumentException("Erreur lors de la vérification du club: " + e.getMessage());
            }

            // Créer et sauvegarder le membre
            MembreClub membre;
            try {
                membre = MembreClub.builder()
                        .userId(userId)
                        .club(club)
                        .role(RoleMembre.MEMBRE)
                        .build();
                membre = membreClubRepository.save(membre);
            } catch (Exception e) {
                log.error("Erreur lors de la sauvegarde du membre: {}", e.getMessage());
                throw new RuntimeException("Erreur lors de l'inscription au club: " + e.getMessage());
            }

            log.info("L'étudiant {} ({} {}) s'est inscrit au club {}",
                    userId, user.getFirstName(), user.getLastName(), clubId);

            return toDto(membre);
        } catch (Exception e) {
            log.error("Erreur lors de l'inscription au club {}: {}", clubId, e.getMessage());
            throw e;
        }
    }

    @Override
    public ClubDto quitterClub(Long clubId, Long userId) {
        // Vérifier si l'utilisateur existe
        UserDTO user = userClient.getUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("L'utilisateur n'existe pas.");
        }

        MembreClub membre = membreClubRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("L'utilisateur n'est pas inscrit dans ce club"));

        membreClubRepository.delete(membre);
        log.info("L'utilisateur {} ({} {}) a quitté le club {}",
                userId, user.getFirstName(), user.getLastName(), clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club non trouvé"));

        return toDto(club);
    }

    @Override
    public MembreClubDto supprimerMembreDuClub(Long clubId, Long membreASupprimerId, Long adminId) {
        // Vérifier si l'admin existe
        UserDTO adminUser = userClient.getUserById(adminId);
        if (adminUser == null) {
            throw new IllegalArgumentException("L'administrateur n'existe pas.");
        }

        // Vérifier si le membre à supprimer existe
        UserDTO membreUser = userClient.getUserById(membreASupprimerId);
        if (membreUser == null) {
            throw new IllegalArgumentException("Le membre à supprimer n'existe pas.");
        }

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
        log.warn("ADMIN {} ({} {}) a supprimé le membre {} ({} {}) du club {}",
                adminId, adminUser.getFirstName(), adminUser.getLastName(),
                membreASupprimerId, membreUser.getFirstName(), membreUser.getLastName(),
                clubId);

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

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    @Override
    public String uploadImage(Long clubId, MultipartFile file) throws IOException {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        if (!isImageFile(file)) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        // Use absolute path for reliability
        Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save full URL instead of just filename
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(filename)
                .toUriString();

        // Remove old image if exists
        if (club.getImage() != null && !club.getImage().isEmpty()) {
            removeImageFile(club.getImage());
        }

        club.setImage(fileUrl);
        clubRepository.save(club);

        return fileUrl;
    }

    @Override
    public boolean removeImage(Long clubId) throws IOException {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        if (club.getImage() == null || club.getImage().isEmpty()) {
            return false; // No image to remove
        }

        boolean removed = removeImageFile(club.getImage());

        if (removed) {
            club.setImage(null);
            clubRepository.save(club);
        }

        return removed;
    }

    private boolean removeImageFile(String imageUrl) {
        try {
            // Extract filename from URL
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

            // Create path to the file
            Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", filename);

            // Delete the file if it exists
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<MembreClubDto> getMembresClub(Long clubId) {
        try {
            // Vérifier si le club existe
            clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club non trouvé avec l'ID: " + clubId));

            // Récupérer tous les membres du club
            List<MembreClub> membres = membreClubRepository.findByClubId(clubId);

            log.info("Récupération de {} membres pour le club {}", membres.size(), clubId);

            // Convertir les entités en DTOs
            return membres.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des membres du club {}: {}", clubId, e.getMessage());
            throw e;
        }
    }
}
