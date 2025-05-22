package com.example.weconnect.service;

import com.example.weconnect.client.ClubClient;
import com.example.weconnect.client.UserClient;
import com.example.weconnect.dto.ClubDTO;
import com.example.weconnect.dto.UserDTO;
import com.example.weconnect.enums.Status;
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
import java.util.List;
import java.util.UUID;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
@Transactional
public class EventService {

    private final EventRepository repo;
    private final UserClient userClient;

    public EventService(EventRepository repo, UserClient userClient) {
        this.repo = repo;
        this.userClient = userClient;

    }

    public Event create(Event e, Long createurId) {
        try {
            // Vérifier que le user existe via userClient
            System.out.println("Attempting to verify user with ID: " + createurId);
            UserDTO user = userClient.getUserById(createurId);

            if (user == null) {
                System.out.println("User not found with ID: " + createurId);
                throw new RuntimeException("User not found with ID: " + createurId);
            }

            System.out.println("User found: " + user.getFirstName() + " " + user.getLastName());
            e.setCreateurId(createurId);

            // Ensure status is set
            if (e.getStatus() == null) {
                e.setStatus(Status.AVENIR);
            }

            // Debug print the event before saving
            System.out.println("Saving event: " + e);

            return repo.save(e);
        } catch (Exception ex) {
            System.err.println("Error creating event: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("Failed to create event: " + ex.getMessage(), ex);
        }
    }

    public List<Event> findAll() {
        return repo.findAll();
    }

    public List<Event> search(String query) {
        return repo.findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(query, query);
    }

    public Event update(Long id, Event data, Long createurId) {
        Event e = repo.findById(id)
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



        return repo.save(e);
    }

    public void delete(Long id, Long createurId) {
        Event e = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }
        repo.delete(e);
    }

    public Event findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Event save(Event event) {
        return repo.save(event);
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    public String uploadImage(Long eventId, MultipartFile file) throws IOException {
        Event event = repo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

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
        if (event.getImage() != null && !event.getImage().isEmpty()) {
            removeImageFile(event.getImage());
        }

        event.setImage(fileUrl);
        repo.save(event);

        return fileUrl;
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

