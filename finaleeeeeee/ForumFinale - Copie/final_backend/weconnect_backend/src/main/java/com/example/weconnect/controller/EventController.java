package com.example.weconnect.controller;

import com.example.weconnect.model.Event;
import com.example.weconnect.service.EventService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService service;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public EventController(EventService service) {
        this.service = service;
    }

    @GetMapping
    public List<Event> all() {
        return service.findAll();
    }

    // GET /api/events/search?search=...
    @GetMapping("/search")
    public List<Event> search(@RequestParam String search) {
        if (search != null && !search.isBlank()) {
            return service.search(search);
        }
        return service.findAll();
    }

    // POST /api/events


    // POST /api/events?createurId=...
    @PostMapping("/create")
    public ResponseEntity<?> create(
            @RequestParam Long createurId,
            @RequestBody Event e) {
        try {
            System.out.println("Received create event request with createurId: " + createurId);
            System.out.println("Event data: " + e);

            Event createdEvent = service.create(e, createurId);
            System.out.println("Event created successfully: " + createdEvent);

            return ResponseEntity.ok(createdEvent);
        } catch (Exception ex) {
            System.err.println("Error in create event endpoint: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating event: " + ex.getMessage());
        }
    }

    // PUT /api/events/{id}?createurId=...
    @PutMapping("/{id}")
    public ResponseEntity<Event> update(
            @PathVariable Long id,
            @RequestParam Long createurId,
            @RequestBody Event e) {
        return ResponseEntity.ok(service.update(id, e, createurId));
    }

    // DELETE /api/events/{id}?createurId=...
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long createurId) {
        service.delete(id, createurId);
        return ResponseEntity.noContent().build();
    }

    // POST /api/events/{id}/upload
    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileUrl = service.uploadImage(id, file);
        return ResponseEntity.ok(fileUrl);
    }

    // DELETE /api/events/{id}/image
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Boolean> removeImage(@PathVariable Long id) throws IOException {
        boolean removed = service.removeImage(id);
        return ResponseEntity.ok(removed);
    }


}
