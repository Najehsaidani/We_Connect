package com.User.Useverification.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.User.Useverification.Model.DTO.ProfileUpdateDTO;
import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.Model.entity.User;

import com.User.Useverification.services.UserServices;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/")
public class UserController {

    private final UserServices userService;

    public UserController(UserServices userService) {
        this.userService = userService;

    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserDto(@PathVariable Long id, @RequestBody ProfileUpdateDTO userDto) {
        try {
            return userService.updateUser(id, userDto);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
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
    public UserDto getuser(@PathVariable Long id) {
        User user = userService.getUser(id);
        return user != null ? UserDto.toDTO(user) : null;
    }

    @GetMapping("/email")
    public UserDto getuser(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        return user != null ? UserDto.toDTO(user) : null;
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
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
    //  @PostMapping("/update_Image/{userId}")
    // public ResponseEntity<?> uploadUserImage(
    //         @PathVariable Long userId, // Get user ID from the URL path
    //         @RequestParam("file") MultipartFile file) { // Get the uploaded file from the request part
    //     try {
    //         // Basic validation
    //         if (file.isEmpty()) {
    //             return ResponseEntity.badRequest().body("Please select a file to upload.");
    //         }

    //         // Call a service method to handle the file processing and saving
    //         // The service method would handle saving the file to disk/cloud
    //         // and updating the user's image path in the database.
    //         userService.saveUserImage(userId, file);

    //         // Return a success response
    //         return ResponseEntity.ok().body("Image uploaded successfully for user " + userId);

    //     } catch (Exception e) {
    //         // Log the error (use a proper logger in a real app)
    //         e.printStackTrace();
    //         // Return an error response
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
    //     }
    // }
    @PostMapping("/{userId}/upload")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileUrl = userService.uploadImage(userId, file);
        return ResponseEntity.ok(fileUrl);
    }

    @DeleteMapping("/{userId}/image")
    public ResponseEntity<Boolean> removeImage(@PathVariable Long userId) throws IOException {
        boolean removed = userService.removeImage(userId);
        return ResponseEntity.ok(removed);
    }

}
