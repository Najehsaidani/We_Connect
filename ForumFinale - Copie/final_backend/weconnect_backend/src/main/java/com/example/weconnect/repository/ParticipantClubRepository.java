package com.example.weconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weconnect.model.ParticipantClub;

@Repository
public interface ParticipantClubRepository extends JpaRepository<ParticipantClub, Long>{
    Optional<ParticipantClub> findByUserIdAndEventClubId(Long userId, Long eventClubId);

    // Compter les participants pour un événement de club donné
    long countByEventClubId(Long eventClubId);

    // Trouver tous les participants d'un événement de club
    List<ParticipantClub> findByEventClubId(Long eventClubId);

    // Trouver toutes les participations d'un utilisateur
    List<ParticipantClub> findByUserId(Long userId);
}
