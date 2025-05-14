package com.example.weconnect.service;

import com.example.weconnect.client.UserClient;
import com.example.weconnect.dto.UserDTO;
import com.example.weconnect.model.EventClub;
import com.example.weconnect.repository.EventClubRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class EventClubService {
    private final EventClubRepository repo;
    private final UserClient userClient;

    public EventClubService(EventClubRepository repo, UserClient userClient) {
        this.repo = repo;
        this.userClient = userClient;
    }

    public EventClub create(EventClub e, Long createurId) {
        UserDTO user = userClient.getUserById(createurId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        e.setCreateurId(createurId);
        
        // if (user.getClubName() != null) {
        //     e.setNomClub(user.getClubName());
        // }
        
        return repo.save(e);
    }
    

    public List<EventClub> findAll() {
        return repo.findAll();
    }

    public List<EventClub> search(String query) {
        return repo.findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(query, query);
    }

    public EventClub update(Long id, EventClub data, Long createurId) {
        EventClub e = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    
        // Verify that only the creator can modify
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }
    
        // Update fields
        e.setTitre(data.getTitre());
        e.setDescription(data.getDescription());
        e.setDateDebut(data.getDateDebut());
        e.setDateFin(data.getDateFin());
        e.setLieu(data.getLieu());
        e.setImage(data.getImage());
        e.setStatus(data.getStatus());
    
        // If user still belongs to a club, update it
        // if (data.getNomClub() != null) {
        //     e.setNomClub(data.getNomClub());
        // }
    
        return repo.save(e);
    }
    

    public void delete(Long id, Long createurId) {
        EventClub e = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getCreateurId().equals(createurId)) {
            throw new RuntimeException("Forbidden: not the creator");
        }
        repo.delete(e);
    }
}
