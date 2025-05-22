package com.User.Useverification.services;


import java.util.List;

import org.springframework.stereotype.Service;

import com.User.Useverification.Model.entity.Role;
import com.User.Useverification.Model.entity.User;
import com.User.Useverification.Model.repository.RoleRepository;
import com.User.Useverification.Model.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class RoleService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public void setUserSingleRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleName);
        if (role == null) {
            throw new RuntimeException("Role not found");
        }

        user.setSingleRole(role); // ✅ Only one role allowed
        userRepository.save(user);
    }

    public String getUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("No role");
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
