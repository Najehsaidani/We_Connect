package com.example.weconnect.repository;



import com.example.weconnect.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    // Vérifie si un utilisateur est déjà inscrit à un événement
    Optional<Participant> findByUserIdAndEventId(Long userId, Long eventId);

    // Compter les participants pour un événement donné
    long countByEventId(Long eventId);

    // Trouver tous les participants d'un événement
    List<Participant> findByEventId(Long eventId);

    // Trouver toutes les participations d'un utilisateur
    List<Participant> findByUserId(Long userId);
}
