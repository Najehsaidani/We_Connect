package com.example.weconnect.controller;

import com.example.weconnect.model.EventClub;
import com.example.weconnect.service.EventClubService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/eventsClubs")
public class EventClubController {

    private final EventClubService service;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public EventClubController(EventClubService service) {
        this.service = service;
    }

    @GetMapping
    public List<EventClub> all() {
        return service.findAll();
    }

    // GET /api/events/search?search=...
    @GetMapping("/search")
    public List<EventClub> search(@RequestParam String search) {
        if (search != null && !search.isBlank()) {
            return service.search(search);
        }
        return service.findAll();
    }

    // POST /api/events


    // POST /api/events?createurId=...
    @PostMapping("/create")
    public ResponseEntity<EventClub> create(
            @RequestParam Long createurId,
            @RequestBody EventClub e) {
        return ResponseEntity.ok(service.create(e, createurId));
    }

    // PUT /api/events/{id}?createurId=...
    @PutMapping("/{id}")
    public ResponseEntity<EventClub> update(
            @PathVariable Long id,
            @RequestParam Long createurId,
            @RequestBody EventClub e) {
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

    // POST /api/eventsClubs/{id}/upload
    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileUrl = service.uploadImage(id, file);
        return ResponseEntity.ok(fileUrl);
    }

    // DELETE /api/eventsClubs/{id}/image
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Boolean> removeImage(@PathVariable Long id) throws IOException {
        boolean removed = service.removeImage(id);
        return ResponseEntity.ok(removed);
    }


}
