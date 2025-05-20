package com.example.weconnect.service;

import com.example.weconnect.model.Event;
import com.example.weconnect.model.Participant;
import com.example.weconnect.model.enums.ParticipantStatus;
import com.example.weconnect.repository.EventRepository;
import com.example.weconnect.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public ParticipantService(ParticipantRepository participantRepository, EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    public Participant joinEvent(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Éviter les doublons
        if (participantRepository.findByUserIdAndEventId(userId, eventId).isPresent()) {
            throw new RuntimeException("Utilisateur déjà inscrit à cet événement.");
        }

        Participant participant = new Participant();
        participant.setUserId(userId);
        participant.setEvent(event);
        participant.setDateInscription(LocalDateTime.now());
        participant.setStatus(ParticipantStatus.CONFIRMED);

        // Add participant to event's collection
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        event.getParticipants().add(participant);

        // Update participant count
        event.setNbParticipants(event.getNbParticipants() + 1);

        // Save event (will cascade to participant)
        eventRepository.save(event);

        return participant;
    }

    public void leaveEvent(Long userId, Long eventId) {
        Participant participant = participantRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("Participation non trouvée."));

        Event event = participant.getEvent();

        // Remove participant from event's collection
        if (event.getParticipants() != null) {
            event.getParticipants().remove(participant);
        }

        // Update participant count
        event.setNbParticipants(Math.max(0, event.getNbParticipants() - 1)); // éviter négatif

        // Save event (will cascade delete the participant)
        eventRepository.save(event);
    }

    public Participant updateStatus(Long userId, Long eventId, ParticipantStatus status) {
        Participant participant = participantRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new RuntimeException("Participation non trouvée."));

        participant.setStatus(status);
        return participantRepository.save(participant);
    }

    public List<Participant> findAll() {
        return participantRepository.findAll();
    }

    public Participant findById(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant non trouvé avec l'ID: " + id));
    }

    public List<Participant> findByEventId(Long eventId) {
        return participantRepository.findByEventId(eventId);
    }

    public List<Participant> findByUserId(Long userId) {
        return participantRepository.findByUserId(userId);
    }
}