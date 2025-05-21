package com.example.forum.service;

import com.example.forum.client.UserClient;
import com.example.forum.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserClient userClient;

    public UserDTO getUserById(Long userId) {
        if (userId == null || userId == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID cannot be null or zero");
        }

        try {
            UserDTO user = userClient.getUserById(userId);
            if (user == null) {
                // If user is not found, return a default user
                log.warn("User not found with ID: {}. Returning default user.", userId);
                return createDefaultUser(userId);
            }
            return user;
        } catch (Exception e) {
            log.error("Error fetching user with ID {}: {}. Returning default user.", userId, e.getMessage());
            // Return a default user instead of throwing an exception
            return createDefaultUser(userId);
        }
    }

    private UserDTO createDefaultUser(Long userId) {
        UserDTO defaultUser = new UserDTO();
        defaultUser.setId(userId);
        defaultUser.setFirstName("User");
        defaultUser.setLastName("#" + userId);
        defaultUser.setEmail("user" + userId + "@example.com");
        defaultUser.setImage("/placeholder.svg");
        return defaultUser;
    }
}
