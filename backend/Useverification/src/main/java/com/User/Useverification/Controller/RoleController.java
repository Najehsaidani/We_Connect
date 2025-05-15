package com.User.Useverification.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.User.Useverification.Model.repository.UserRepository;
import com.User.Useverification.Request.RoleAssignmentRequest;
import com.User.Useverification.services.RoleService;

import com.User.Useverification.Request.StatusUpdateRequest;
import com.User.Useverification.enums.Status;
import com.User.Useverification.Model.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;
    private final UserRepository userRepository;


    
    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String,String>> assignSingleRole(
            @PathVariable Long id,
            @RequestBody RoleAssignmentRequest request) {
        roleService.setUserSingleRole(id, request.getRole());
        return ResponseEntity.ok(Map.of("message", "Role assigned."));
    }

    
    @GetMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> getRole(@PathVariable Long id) {
        String role = roleService.getUserRole(id);
        return ResponseEntity.ok(Map.of("role", role));
    }

    @PostMapping("/users/{id}/Status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest statusUpdateRequest) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Status newStatus;
            try {
                newStatus = Status.valueOf(statusUpdateRequest.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status value");
            }

            user.setStatus(newStatus);
            userRepository.save(user);

            return ResponseEntity.ok("User status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            return ResponseEntity.ok(roleService.getAllRoles());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    

}
