package com.example.forum.service;

import com.example.forum.model.Report;
import com.example.forum.exception.ResourceNotFoundException;
import com.example.forum.model.Post;
import com.example.forum.repository.ReportRepository;
import com.example.forum.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserService userService;

    public Report createReport(Long postId, Long userId, String reason) throws ResourceNotFoundException {
        if (reportRepository.existsByUserIdAndPost_Id(userId, postId)) {
            //throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already reported this post");
            throw new ResourceNotFoundException("You have already reported this post");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Verify user exists by fetching from UserService
        userService.getUserById(userId);

        Report report = Report.builder()
                .post(post)
                .userId(userId)
                .reason(reason)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        post.setReports(post.getReports() + 1);
        postRepository.save(post);

        return reportRepository.save(report);
    }

    public List<Report> getReportsByPostId(Long postId) {
        return reportRepository.findByPost_IdOrderByCreatedAtDesc(postId);
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc("PENDING");
    }

    public Report updateReportStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        if (!status.matches("PENDING|REVIEWED|RESOLVED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        report.setStatus(status);
        return reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        Post post = report.getPost();
        post.setReports(post.getReports() - 1);
        postRepository.save(post);

        reportRepository.deleteById(id);
    }
}