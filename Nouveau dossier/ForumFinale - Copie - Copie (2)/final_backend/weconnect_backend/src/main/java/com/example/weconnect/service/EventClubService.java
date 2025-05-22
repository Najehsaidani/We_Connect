package com.example.weconnect.service;

import com.example.weconnect.client.ClubClient;
import com.example.weconnect.client.UserClient;
import com.example.weconnect.dto.ClubDTO;
import com.example.weconnect.dto.UserDTO;
import com.example.weconnect.model.EventClub;
import com.example.weconnect.repository.EventClubRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
@Transactional
public class EventClubService {
    private static final Logger logger = LoggerFactory.getLogger(EventClubService.class);

    private final EventClubRepository repo;
    private final UserClient userClient;
    private final ClubClient clubClient;

    public EventClubService(EventClubRepository repo, UserClient userClient, ClubClient clubClient) {
        this.repo = repo;
        this.userClient = userClient;
        this.clubClient = clubClient;
    }

    public EventClub create(EventClub e, Long createurId) {
        try {
            logger.info("Creating club event with title: {}, for user ID: {}, club ID: {}",
                       e.getTitre(), createurId, e.getClubId());

            // Vérifier que le user existe via userClient
            try {
                UserDTO user = userClient.getUserById(createurId);
                if (user == null) {
                    logger.warn("User not found with ID: {}, but proceeding with event creation", createurId);
                }
            } catch (Exception userEx) {
                // Log the error but continue with event creation
                logger.warn("Error verifying user with ID: {}, but proceeding with event creation: {}",
                           createurId, userEx.getMessage());
            }

            e.setCreateurId(createurId);

            // Si un clubId est fourni, récupérer le club via clubClient
            if (e.getClubId() != null) {
                try {
                    ClubDTO club = clubClient.getClubById(e.getClubId());
                    if (club == null) {
                        logger.warn("Club not found with ID: {}, using default club name", e.getClubId());
                        e.setNomClub("Club #" + e.getClubId());
                    } else {
                        e.setNomClub(club.getNom());
                        logger.info("Retrieved club name: {} for club ID: {}", club.getNom(), e.getClubId());
                    }
                } catch (Exception ex) {
                    logger.warn("Error retrieving club with ID {}: {}, using default club name",
                               e.getClubId(), ex.getMessage());
                    e.setNomClub("Club #" + e.getClubId());
                }
            }

            // Ensure dates are properly set
            validateAndFixDates(e);

            logger.info("Saving club event to database");
            return repo.save(e);
        } catch (Exception ex) {
            logger.error("Error creating club event: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    private void validateAndFixDates(EventClub event) {
        logger.info("Validating event club dates: dateDebut={}, dateFin={}",
                    event.getDateDebut(), event.getDateFin());

        // If dates are null, set default values
        if (event.getDateDebut() == null) {
            event.setDateDebut(LocalDateTime.now());
            logger.info("Setting default dateDebut: {}", event.getDateDebut());
        }

        if (event.getDateFin() == null) {
            event.setDateFin(event.getDateDebut().plusHours(1));
            logger.info("Setting default dateFin: {}", event.getDateFin());
        }

        // Ensure dates are in the correct format
        try {
            // Log the date formats for debugging
            logger.info("Date formats - dateDebut: {}, dateFin: {}",
                       event.getDateDebut().toString(), event.getDateFin().toString());
        } catch (Exception ex) {
            logger.error("Error formatting dates: {}", ex.getMessage(), ex);
        }
    }

    public List<EventClub> findAll() {
        return repo.findAll();
    }

    public List<EventClub> search(String query) {
        return repo.findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(query, query);
    }

    public EventClub update(Long id, EventClub data, Long createurId) {
        EventClub e = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Vérifier que seul le créateur peut modifier
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }

        e.setTitre(data.getTitre());
        e.setDescription(data.getDescription());
        e.setDateDebut(data.getDateDebut());
        e.setDateFin(data.getDateFin());
        e.setLieu(data.getLieu());
        e.setStatus(data.getStatus());

        // Si clubId est modifié, mettre à jour nomClub aussi
        if (data.getClubId() != null && !data.getClubId().equals(e.getClubId())) {
            ClubDTO club = clubClient.getClubById(data.getClubId());
            if (club == null) {
                throw new RuntimeException("Club not found");
            }
            e.setClubId(data.getClubId());
            e.setNomClub(club.getNom());
        }

        return repo.save(e);
    }

    public void delete(Long id, Long createurId) {
        EventClub e = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }
        repo.delete(e);
    }

    public EventClub findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public EventClub save(EventClub eventClub) {
        return repo.save(eventClub);
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    public String uploadImage(Long eventClubId, MultipartFile file) throws IOException {
        EventClub eventClub = repo.findById(eventClubId)
                .orElseThrow(() -> new RuntimeException("EventClub not found"));

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
        if (eventClub.getImage() != null && !eventClub.getImage().isEmpty()) {
            removeImageFile(eventClub.getImage());
        }

        eventClub.setImage(fileUrl);
        repo.save(eventClub);

        return fileUrl;
    }

    public boolean removeImage(Long eventClubId) throws IOException {
        EventClub eventClub = repo.findById(eventClubId)
                .orElseThrow(() -> new RuntimeException("EventClub not found"));

        if (eventClub.getImage() == null || eventClub.getImage().isEmpty()) {
            return false; // No image to remove
        }

        boolean removed = removeImageFile(eventClub.getImage());

        if (removed) {
            eventClub.setImage(null);
            repo.save(eventClub);
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
}

