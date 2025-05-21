package com.example.forum.repository;

import com.example.forum.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByPost_IdOrderByCreatedAtDesc(Long postId);
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByUserIdAndPost_Id(Long userId, Long postId);
}