package com.example.weconnect.controller;

import com.example.weconnect.model.ParticipantClub;
import com.example.weconnect.model.enums.ParticipantStatus;
import com.example.weconnect.service.ParticipantsclubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantsClub")
public class ParticipantClubController {

    private final ParticipantsclubService participantsclubService;

    public ParticipantClubController(ParticipantsclubService participantsclubService) {
        this.participantsclubService = participantsclubService;
    }

    // POST pour participer à un événement de club
    @PostMapping("/join")
    public ResponseEntity<ParticipantClub> joinEventClub(
            @RequestParam Long userId,
            @RequestParam Long eventClubId) {
        return ResponseEntity.ok(participantsclubService.joinEventClub(userId, eventClubId));
    }

    // DELETE pour annuler la participation à un événement de club
    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveEventClub(
            @RequestParam Long userId,
            @RequestParam Long eventClubId) {
        participantsclubService.leaveEventClub(userId, eventClubId);
        return ResponseEntity.noContent().build();
    }

    // PATCH pour mettre à jour le statut d'une participation à un événement de club
    @PutMapping("/status")
    public ResponseEntity<ParticipantClub> updateStatus(
            @RequestParam Long userId,
            @RequestParam Long eventClubId,
            @RequestParam ParticipantStatus status) {
        return ResponseEntity.ok(participantsclubService.updateStatus(userId, eventClubId, status));
    }

    // GET pour récupérer tous les participants aux événements de club
    @GetMapping
    public ResponseEntity<List<ParticipantClub>> getAllParticipantsClub() {
        return ResponseEntity.ok(participantsclubService.findAll());
    }

    // GET pour récupérer un participant par son ID
    @GetMapping("/{id}")
    public ResponseEntity<ParticipantClub> getParticipantClubById(@PathVariable Long id) {
        return ResponseEntity.ok(participantsclubService.findById(id));
    }

    // GET pour récupérer tous les participants d'un événement de club
    @GetMapping("/eventClub/{eventClubId}")
    public ResponseEntity<List<ParticipantClub>> getParticipantsClubByEventClubId(@PathVariable Long eventClubId) {
        return ResponseEntity.ok(participantsclubService.findByEventClubId(eventClubId));
    }

    // GET pour récupérer toutes les participations d'un utilisateur aux événements de club
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ParticipantClub>> getParticipantsClubByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(participantsclubService.findByUserId(userId));
    }
}
