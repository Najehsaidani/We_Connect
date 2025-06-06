package com.example.forum.controller;

import com.example.forum.model.Report;
import com.example.forum.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:8081")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Map<String, Object> payload) {
        Long postId = Long.parseLong(payload.get("postId").toString());
        Long userId = Long.parseLong(payload.get("userId").toString());
        String reason = payload.get("reason").toString();
        
        Report newReport = reportService.createReport(postId, userId, reason);
        return ResponseEntity.ok(newReport);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Report>> getReportsByPostId(@PathVariable Long postId) {
        List<Report> reports = reportService.getReportsByPostId(postId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Report>> getPendingReports() {
        List<Report> reports = reportService.getPendingReports();
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Report updatedReport = reportService.updateReportStatus(id, status);
        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}