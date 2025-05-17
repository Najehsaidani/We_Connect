package com.example.weconnect.controller;

import com.example.weconnect.model.EventClub;
import com.example.weconnect.service.EventClubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventClubController {

    private final EventClubService service;

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
}
