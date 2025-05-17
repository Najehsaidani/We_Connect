package com.example.weconnect.service;

import com.example.weconnect.client.ClubClient;
import com.example.weconnect.client.UserClient;
import com.example.weconnect.dto.ClubDTO;
import com.example.weconnect.dto.UserDTO;
import com.example.weconnect.model.Event;
import com.example.weconnect.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EventService {

    private final EventRepository repo;
    private final UserClient userClient;
    private final ClubClient clubClient;

    public EventService(EventRepository repo, UserClient userClient, ClubClient clubClient) {
        this.repo = repo;
        this.userClient = userClient;
        this.clubClient = clubClient;
    }

    public Event create(Event e, Long createurId) {
        // Vérifier que le user existe via userClient
        UserDTO user = userClient.getUserById(createurId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        e.setCreateurId(createurId);

        // Si un clubId est fourni, récupérer le club via clubClient
        if (e.getClubId() != null) {
            ClubDTO club = clubClient.getClubById(e.getClubId());
            if (club == null) {
                throw new RuntimeException("Club not found");
            }
            e.setNomClub(club.getNom());
        }

        return repo.save(e);
    }

    public List<Event> findAll() {
        return repo.findAll();
    }

    public List<Event> search(String query) {
        return repo.findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(query, query);
    }

    public Event update(Long id, Event data, Long createurId) {
        Event e = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Vérifier que seul le créateur peut modifier
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }

        e.setTitre(data.getTitre());
        e.setDescription(data.getDescription());
        e.setDateDebut(data.getDateDebut());
        e.setDateFin(data.getDateFin());
        e.setLieu(data.getLieu());
        e.setImage(data.getImage());
        e.setStatus(data.getStatus());

        // Si clubId est modifié, mettre à jour nomClub aussi
        if (data.getClubId() != null && !data.getClubId().equals(e.getClubId())) {
            ClubDTO club = clubClient.getClubById(data.getClubId());
            if (club == null) {
                throw new RuntimeException("Club not found");
            }
            e.setClubId(data.getClubId());
            e.setNomClub(club.getNom());
        }

        return repo.save(e);
    }

    public void delete(Long id, Long createurId) {
        Event e = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }
        repo.delete(e);
    }
}

