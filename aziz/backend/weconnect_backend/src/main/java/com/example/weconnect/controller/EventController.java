package com.example.weconnect.controller;

import com.example.weconnect.model.Event;
import com.example.weconnect.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService service;

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
}
