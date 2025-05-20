package com.example.weconnect.controller;

import com.example.weconnect.model.Participant;
import com.example.weconnect.model.enums.ParticipantStatus;
import com.example.weconnect.service.ParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    // POST pour participer
    @PostMapping("/join")
    public ResponseEntity<Participant> joinEvent(
            @RequestParam Long userId,
            @RequestParam Long eventId) {
        return ResponseEntity.ok(participantService.joinEvent(userId, eventId));
    }

    // DELETE pour annuler la participation
    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveEvent(
            @RequestParam Long userId,
            @RequestParam Long eventId) {
        participantService.leaveEvent(userId, eventId);
        return ResponseEntity.noContent().build();
    }

    // PATCH pour mettre à jour le statut d'une participation
    @PutMapping("/status")
    public ResponseEntity<Participant> updateStatus(
            @RequestParam Long userId,
            @RequestParam Long eventId,
            @RequestParam ParticipantStatus status) {
        return ResponseEntity.ok(participantService.updateStatus(userId, eventId, status));
    }

    // GET pour récupérer tous les participants
    @GetMapping
    public ResponseEntity<List<Participant>> getAllParticipants() {
        return ResponseEntity.ok(participantService.findAll());
    }

    // GET pour récupérer un participant par son ID
    @GetMapping("/{id}")
    public ResponseEntity<Participant> getParticipantById(@PathVariable Long id) {
        return ResponseEntity.ok(participantService.findById(id));
    }

    // GET pour récupérer tous les participants d'un événement
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Participant>> getParticipantsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(participantService.findByEventId(eventId));
    }

    // GET pour récupérer toutes les participations d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Participant>> getParticipantsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(participantService.findByUserId(userId));
    }
}