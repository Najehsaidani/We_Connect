package com.example.weconnect.controller;

import com.example.weconnect.model.Participant;
import com.example.weconnect.service.ParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}