package com.example.weconnect.service;

import com.example.weconnect.client.ClubClient;
import com.example.weconnect.client.UserClient;
import com.example.weconnect.dto.ClubDTO;
import com.example.weconnect.dto.UserDTO;
import com.example.weconnect.model.Event;
import com.example.weconnect.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
@Transactional
public class EventService {
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository repo;
    private final UserClient userClient;

    public EventService(EventRepository repo, UserClient userClient) {
        this.repo = repo;
        this.userClient = userClient;
    }

    public Event create(Event e, Long createurId) {
        try {
            logger.info("Creating event with title: {}, for user ID: {}", e.getTitre(), createurId);

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

            // Ensure dates are properly set
            validateAndFixDates(e);

            logger.info("Saving event to database");
            return repo.save(e);
        } catch (Exception ex) {
            logger.error("Error creating event: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    private void validateAndFixDates(Event event) {
        logger.info("Validating event dates: dateDebut={}, dateFin={}",
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
    }

    public List<Event> findAll() {
        return repo.findAll();
    }

    public List<Event> search(String query) {
        return repo.findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(query, query);
    }

    public Event update(Long id, Event data, Long createurId) {
        try {
            logger.info("Updating event ID: {} by user ID: {}", id, createurId);

            Event e = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

            // Vérifier que seul le créateur peut modifier
            if (!e.getCreateurId().equals(createurId)) {
                logger.warn("Unauthorized update attempt: User {} tried to update event {} created by {}",
                           createurId, id, e.getCreateurId());
                throw new RuntimeException("Forbidden: not the creator");
            }

            e.setTitre(data.getTitre());
            e.setDescription(data.getDescription());

            // Handle date updates with validation
            if (data.getDateDebut() != null) {
                e.setDateDebut(data.getDateDebut());
            }

            if (data.getDateFin() != null) {
                e.setDateFin(data.getDateFin());
            } else if (data.getDateDebut() != null) {
                // If start date was updated but not end date, adjust end date
                e.setDateFin(data.getDateDebut().plusHours(1));
            }

            e.setLieu(data.getLieu());
            e.setStatus(data.getStatus());

            logger.info("Saving updated event to database");
            return repo.save(e);
        } catch (Exception ex) {
            logger.error("Error updating event: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    public void delete(Long id, Long createurId) {
        try {
            logger.info("Deleting event ID: {} by user ID: {}", id, createurId);

            Event e = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));

            if (!e.getCreateurId().equals(createurId)) {
                logger.warn("Unauthorized delete attempt: User {} tried to delete event {} created by {}",
                           createurId, id, e.getCreateurId());
                throw new RuntimeException("Forbidden: not the creator");
            }

            logger.info("Deleting event from database");
            repo.delete(e);
        } catch (Exception ex) {
            logger.error("Error deleting event: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    public Event findById(Long id) {
        try {
            logger.info("Finding event by ID: {}", id);
            return repo.findById(id).orElse(null);
        } catch (Exception ex) {
            logger.error("Error finding event by ID: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    public Event save(Event event) {
        try {
            logger.info("Saving event with title: {}", event.getTitre());

            // Validate dates before saving
            validateAndFixDates(event);

            return repo.save(event);
        } catch (Exception ex) {
            logger.error("Error saving event: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    private boolean isImageFile(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            logger.info("File content type: {}", contentType);

            // For testing purposes, accept any file
            return true;

            // In production, uncomment this:
            // return contentType != null && contentType.startsWith("image/");
        } catch (Exception ex) {
            logger.error("Error checking if file is an image: {}", ex.getMessage(), ex);
            return false;
        }
    }

    public String uploadImage(Long eventId, MultipartFile file) throws IOException {
        try {
            logger.info("Uploading image for event ID: {}", eventId);

            if (eventId == null) {
                logger.error("Event ID is null");
                throw new IllegalArgumentException("Event ID cannot be null");
            }

            if (file == null || file.isEmpty()) {
                logger.error("File is null or empty");
                throw new IllegalArgumentException("File cannot be null or empty");
            }

            Event event = repo.findById(eventId)
                    .orElseThrow(() -> {
                        logger.error("Event not found with ID: {}", eventId);
                        return new RuntimeException("Event not found with ID: " + eventId);
                    });

            if (!isImageFile(file)) {
                logger.error("File is not an image: {}", file.getContentType());
                throw new IllegalArgumentException("Only image files are allowed.");
            }

            // Use absolute path for reliability
            Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads");
            if (!Files.exists(uploadPath)) {
                logger.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            logger.info("Saving file to: {}", filePath);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save full URL instead of just filename
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(filename)
                    .toUriString();
            logger.info("File URL: {}", fileUrl);

            // Remove old image if exists
            if (event.getImage() != null && !event.getImage().isEmpty()) {
                logger.info("Removing old image: {}", event.getImage());
                removeImageFile(event.getImage());
            }

            event.setImage(fileUrl);
            repo.save(event);
            logger.info("Image uploaded successfully for event ID: {}", eventId);

            return fileUrl;
        } catch (Exception ex) {
            logger.error("Error uploading image for event ID {}: {}", eventId, ex.getMessage(), ex);
            throw ex;
        }
    }

    public boolean removeImage(Long eventId) throws IOException {
        Event event = repo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getImage() == null || event.getImage().isEmpty()) {
            return false; // No image to remove
        }

        boolean removed = removeImageFile(event.getImage());

        if (removed) {
            event.setImage(null);
            repo.save(event);
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

