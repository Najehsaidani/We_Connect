package com.example.weconnect.repository;

import com.example.weconnect.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByTitreContainingIgnoreCaseOrLieuContainingIgnoreCase(String titre, String lieu);
}
