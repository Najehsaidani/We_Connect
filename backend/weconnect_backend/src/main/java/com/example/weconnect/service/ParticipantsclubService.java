package com.example.weconnect.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.weconnect.model.EventClub;
import com.example.weconnect.model.ParticipantClub;
import com.example.weconnect.model.enums.ParticipantStatus;
import com.example.weconnect.repository.EventClubRepository;
import com.example.weconnect.repository.ParticipantClubRepository;


@Service
public class ParticipantsclubService {
    private final ParticipantClubRepository participantClubRepository;
    private final EventClubRepository eventClubRepository;

    public ParticipantsclubService(ParticipantClubRepository participantClubRepository, EventClubRepository eventClubRepository) {
        this.participantClubRepository = participantClubRepository;
        this.eventClubRepository = eventClubRepository;
    }

    public ParticipantClub joinEventClub(Long userId, Long eventClubId) {
        EventClub eventClub = eventClubRepository.findById(eventClubId)
                .orElseThrow(() -> new RuntimeException("EventClub not found"));

        // Éviter les doublons
        if (participantClubRepository.findByUserIdAndEventClubId(userId, eventClubId).isPresent()) {
            throw new RuntimeException("Utilisateur déjà inscrit à cet événement de club.");
        }

        ParticipantClub participantClub = new ParticipantClub();
        participantClub.setUserId(userId);
        participantClub.setEventClub(eventClub);
        participantClub.setDateInscription(LocalDateTime.now());
        participantClub.setStatus(ParticipantStatus.CONFIRMED);

        // Add participantClub to eventClub's collection
        if (eventClub.getParticipantsClub() == null) {
            eventClub.setParticipantsClub(new ArrayList<>());
        }
        eventClub.getParticipantsClub().add(participantClub);

        // Update participant count
        eventClub.setNbParticipants(eventClub.getNbParticipants() + 1);

        // Save eventClub (will cascade to participantClub)
        eventClubRepository.save(eventClub);

        return participantClub;
    }

    public void leaveEventClub(Long userId, Long eventClubId) {
        ParticipantClub participantClub = participantClubRepository.findByUserIdAndEventClubId(userId, eventClubId)
                .orElseThrow(() -> new RuntimeException("Participation non trouvée."));

        EventClub eventClub = participantClub.getEventClub();

        // Remove participantClub from eventClub's collection
        if (eventClub.getParticipantsClub() != null) {
            eventClub.getParticipantsClub().remove(participantClub);
        }

        // Update participant count
        eventClub.setNbParticipants(Math.max(0, eventClub.getNbParticipants() - 1)); // éviter négatif

        // Save eventClub (will cascade delete the participantClub)
        eventClubRepository.save(eventClub);
    }

    public ParticipantClub updateStatus(Long userId, Long eventClubId, ParticipantStatus status) {
        ParticipantClub participantClub = participantClubRepository.findByUserIdAndEventClubId(userId, eventClubId)
                .orElseThrow(() -> new RuntimeException("Participation non trouvée."));

        participantClub.setStatus(status);
        return participantClubRepository.save(participantClub);
    }

    public List<ParticipantClub> findAll() {
        return participantClubRepository.findAll();
    }

    public ParticipantClub findById(Long id) {
        return participantClubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ParticipantClub non trouvé avec l'ID: " + id));
    }

    public List<ParticipantClub> findByEventClubId(Long eventClubId) {
        return participantClubRepository.findByEventClubId(eventClubId);
    }

    public List<ParticipantClub> findByUserId(Long userId) {
        return participantClubRepository.findByUserId(userId);
    }
}