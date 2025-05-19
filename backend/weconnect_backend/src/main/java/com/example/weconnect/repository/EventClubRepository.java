package com.example.weconnect.repository;

import com.example.weconnect.model.EventClub;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventClubRepository extends JpaRepository<EventClub, Long> {
    List<EventClub> findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(String titre, String lieu);
}
