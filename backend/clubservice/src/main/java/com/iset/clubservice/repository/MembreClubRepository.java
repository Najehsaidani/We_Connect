package com.iset.clubservice.repository;

import com.iset.clubservice.model.entity.MembreClub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembreClubRepository extends JpaRepository<MembreClub, Long> {
    Optional<MembreClub> findByClubIdAndUserId(Long clubId, Long userId);
    boolean existsByClubIdAndUserId(Long clubId, Long userId);
}
