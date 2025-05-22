package com.example.weconnect.controller;

import com.example.weconnect.model.Event;
import com.example.weconnect.service.EventService;
import org.springframework.beans.factory.annotation.Value;
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
    public ResponseEntity<Event> create(
            @RequestParam Long createurId,
            @RequestBody Event e) {
        return ResponseEntity.ok(service.create(e, createurId));
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
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Event ID cannot be null");
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File cannot be null or empty");
            }

            String fileUrl = service.uploadImage(id, file);
            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading image: " + e.getMessage());
        }
    }

    // DELETE /api/events/{id}/image
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Boolean> removeImage(@PathVariable Long id) throws IOException {
        boolean removed = service.removeImage(id);
        return ResponseEntity.ok(removed);
    }


}
