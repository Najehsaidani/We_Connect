package com.example.forum.controller;

import com.example.forum.model.UserActivity;
import com.example.forum.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/user-activities")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:5173"}, allowedHeaders = "*", methods = {RequestMethod.GET})
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserActivity>> getUserActivities(@PathVariable Long userId) {
        try {
            if (userId == null || userId == 0) {
                return ResponseEntity.badRequest().build();
            }
            
            List<UserActivity> activities = userActivityService.getUserActivities(userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erreur lors de la récupération des activités: " + e.getMessage()
            );
        }
    }
}
