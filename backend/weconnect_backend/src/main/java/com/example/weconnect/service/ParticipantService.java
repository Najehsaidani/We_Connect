package com.example.weconnect.service;

import com.example.weconnect.model.EventClub;
import com.example.weconnect.model.Participant;
import com.example.weconnect.repository.EventClubRepository;
import com.example.weconnect.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventClubRepository eventClubRepository;

    public ParticipantService(ParticipantRepository participantRepository, EventClubRepository eventClubRepository) {
        this.participantRepository = participantRepository;
        this.eventClubRepository = eventClubRepository;
    }

    public Participant joinEvent(Long userId, Long eventId) {
        EventClub event = eventClubRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Éviter les doublons
        if (participantRepository.findByUserIdAndEventId(userId, eventId).isPresent()) {
            throw new RuntimeException("Utilisateur déjà inscrit à cet événement.");
        }

        Participant participant = new Participant();
        participant.setUserId(userId);
        participant.setEvent(event);
        participant.setDateInscription(LocalDateTime.now());
        participant.setStatus("CONFIRMED");

        participantRepository.save(participant);

        event.setNbParticipants(event.getNbParticipants() + 1);
        eventClubRepository.save(event);

        return participant;
    }

    public void leaveEvent(Long userId, Long eventId) {
        Participant participant = participantRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("Participation non trouvée."));

        participantRepository.delete(participant);

        EventClub event = participant.getEvent();
        event.setNbParticipants(Math.max(0, event.getNbParticipants() - 1)); // éviter négatif
        eventClubRepository.save(event);
    }
}