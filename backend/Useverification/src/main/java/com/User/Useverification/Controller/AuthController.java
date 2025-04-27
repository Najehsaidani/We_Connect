package com.User.Useverification.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.Model.entity.User;
import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Security.JwtTokenUtil;
import com.User.Useverification.services.UserServices;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/")
public class AuthController {

    private final UserServices userService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthController(UserServices userService, JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserDto(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            return userService.updateUser(id, userDto);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        try {
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Delete failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @GetMapping("/{id}")
    public User getuser(@PathVariable Long id) {
    return userService.getUser(id);
        
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            // Return the list of UserDto wrapped in ResponseEntity
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve users: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
