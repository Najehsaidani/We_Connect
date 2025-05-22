package com.User.Useverification.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.User.Useverification.Model.DTO.ProfileUpdateDTO;
import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.Model.entity.Role;
import com.User.Useverification.Model.entity.User;
import com.User.Useverification.Model.repository.RoleRepository;
import com.User.Useverification.Model.repository.UserRepository;
import com.User.Useverification.Request.ChangePasswordRequest;
import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Request.RegisterRequest;
import com.User.Useverification.Request.ResetPasswordRequest;
import com.User.Useverification.Request.ResetRequest;
import com.User.Useverification.Request.VerifRequest;
import com.User.Useverification.Response.ResponseUser;
import com.User.Useverification.Security.JwtTokenUtil;
import com.User.Useverification.enums.Status;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServices {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public ResponseEntity<?> registerUser(RegisterRequest registerRequest) {
        try {
            User existingUser = userRepository.findByEmail(registerRequest.getEmail());
            if (existingUser != null && existingUser.isCompteEnable()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User Already Registered");
                return ResponseEntity.badRequest().body(error);
            }

            String verificationCode = generateOTP();
            Date verificationExpiry = Date.from(LocalDateTime.now().plusMinutes(5).atZone(ZoneId.systemDefault()).toInstant());

            Role defaultRole = roleRepository.findByName("ROLE_ETUDIANT");
            if (defaultRole == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Default role not found");
                return ResponseEntity.badRequest().body(error);
            }

            User user = User.builder()
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .email(registerRequest.getEmail())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .createdTimes(new Date())
                    .enabled(false)
                    .verificationCode(verificationCode)
                    .verificationCodeExpiration(verificationExpiry)
                    .status(Status.ACTIF)
                    .build();

            user.setSingleRole(defaultRole);

            userRepository.save(user);
            sendVerificationEmail(user.getEmail(), verificationCode);

            return ResponseEntity.ok(new ResponseUser(user.getFirstName(), user.getEmail()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (user.isCompteEnable()) {
            throw new RuntimeException("User is already verified");
        }

        String verificationCode = generateOTP();
        Date verificationExpiry = Date.from(LocalDateTime.now().plusMinutes(5).atZone(ZoneId.systemDefault()).toInstant());

        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiration(verificationExpiry);
        userRepository.save(user);
        sendVerificationEmail(user.getEmail(), verificationCode);
    }

    public ResponseEntity<?> login(LoginRequest loginRequest) {
        try {
            // 1. Find user by email
            User existingUser = userRepository.findByEmail(loginRequest.getEmail());
            if (existingUser == null) {
                throw new RuntimeException("User not found");
            }

            // 2. Validate password
            if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
                throw new RuntimeException("Invalid password");
            }

            // 3. Check enabled status
            if (!existingUser.isCompteEnable()) {
                throw new RuntimeException("User is not verified");
            }
            if (!existingUser.isAccountNonLocked()) {
                throw new RuntimeException("User is Bloqued");
            }
            if (!existingUser.isAccountNonExpired()) {
                throw new RuntimeException("User account is expired");
            }
            if (!existingUser.isEnabled()) {
                throw new RuntimeException("User account is disabled");
            }
            if (existingUser.isSuspendu()) {
                throw new RuntimeException("User account is suspended");
            }


            // 4. Generate JWT token
            String token = jwtTokenUtil.generateToken(loginRequest.getEmail());

            // 5. Return success response with token and userId
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Login successful");
            responseBody.put("token", token);
            responseBody.put("userId", existingUser.getId());
            responseBody.put("user", new ResponseUser(existingUser.getFirstName(), existingUser.getEmail()));

            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + token)
                    .body(responseBody);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    public void verifyUser(VerifRequest verifRequest) {
        User user = userRepository.findByEmail(verifRequest.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (user.isCompteEnable()) {
            throw new RuntimeException("User is already verified");
        }
        if (user.getVerificationCodeExpiration() == null || new Date().after(user.getVerificationCodeExpiration())) {
            throw new RuntimeException("Verification code expired");
        }
        if (verifRequest.getVerificationCode().equals(user.getVerificationCode())) {
            user.setEnabled(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiration(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid OTP");
        }
    }

    private String generateOTP() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    private void sendVerificationEmail(String email, String otp) {
        String subject = "Verify Your Email Address";
        String body = "<div style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;'>"
                + "<div style='max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>"
                + "<h2 style='text-align: center; color: #111;'>Welcome!</h2>"
                + "<p style='font-size: 16px; color: #555;'>Hello,</p>"
                + "<p style='font-size: 16px; color: #555;'>Thank you for signing up. To complete your registration, please use the following verification code:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<span style='font-size: 30px; color: #4CAF50; font-weight: bold; letter-spacing: 2px;'>" + otp + "</span>"
                + "</div>"
                + "<p style='font-size: 14px; color: #777;'>This code is valid for only 5 minutes.</p>"
                + "<p style='font-size: 14px; color: #777;'>If you did not create an account, you can safely ignore this email.</p>"
                + "<hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>"
                + "<p style='text-align: center; font-size: 12px; color: #aaa;'>Thank you,<br>The Team</p>"
                + "</div>"
                + "</div>";
        emailService.sendEmail(email, subject, body);
    }

    public boolean sendOtpForVerification(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) return false;

        String verificationCode = generateOTP();
        Date verificationExpiry = Date.from(LocalDateTime.now().plusMinutes(5).atZone(ZoneId.systemDefault()).toInstant());

        user.setEnabled(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiration(verificationExpiry);
        userRepository.save(user);
        sendVerificationEmail(user.getEmail(), verificationCode);

        return true;
    }

    public ResponseEntity<Map<String, String>> generateResetPasswordToken(String email) {
        Map<String, String> response = new HashMap<>();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        String token = generateOTP();
        Date expiry = Date.from(LocalDateTime.now().plusMinutes(10).atZone(ZoneId.systemDefault()).toInstant());

        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiration(expiry);
        userRepository.save(user);

        String subject = "Reset Your Password";
        String body = "<div style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;'>"
                + "<div style='max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>"
                + "<h2 style='text-align: center; color: #333;'>Password Reset Request</h2>"
                + "<p style='font-size: 16px; color: #555;'>Hi there,</p>"
                + "<p style='font-size: 16px; color: #555;'>You requested to reset your password. Please use the code below to continue:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<span style='font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4CAF50;'>" + token + "</span>"
                + "</div>"
                + "<p style='font-size: 14px; color: #777;'>This code will expire in 10 minutes. Please do not share it with anyone.</p>"
                + "<p style='font-size: 14px; color: #777;'>If you didn't request a password reset, you can ignore this email safely.</p>"
                + "<hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>"
                + "<p style='text-align: center; font-size: 12px; color: #aaa;'>Thank you,<br>The Blackhat Team</p>"
                + "</div>"
                + "</div>";

        emailService.sendEmail(user.getEmail(), subject, body);
        response.put("message", "Reset password token sent to email");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, String>> validateResetToken(ResetRequest resetRequest) {
        Map<String, String> response = new HashMap<>();
        User user = userRepository.findByEmail(resetRequest.getEmail());
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (user.getResetPasswordToken() == null || !resetRequest.getResetPasswordToken().equals(user.getResetPasswordToken())) {
            response.put("error", "Invalid or missing reset token");
            return ResponseEntity.badRequest().body(response);
        }

        if (user.getResetPasswordTokenExpiration() == null || new Date().after(user.getResetPasswordTokenExpiration())) {
            response.put("error", "Reset token expired");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("token", user.getResetPasswordToken());
        response.put("message", "Reset token is valid");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, String>> resetPassword(ResetPasswordRequest resetPasswordRequest) {
        Map<String, String> response = new HashMap<>();
        User user = userRepository.findByEmail(resetPasswordRequest.getEmail());
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (!resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmationPassword())) {
            response.put("error", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }

        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiration(null);
        userRepository.save(user);

        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, String>> changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
        Map<String, String> response = new HashMap<>();

        // Find user by ID
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            response.put("error", "Current password is incorrect");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if new password and confirmation match
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmationPassword())) {
            response.put("error", "New passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> updateUser(Long id,ProfileUpdateDTO userDto) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setDateOfBirth(userDto.getDateOfBirth());
        user.setAddress(userDto.getAddress());
        user.setDepartement(userDto.getDepartement());
        user.setBiographie(userDto.getBiographie());

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully");
    }

    public String deleteUser(Long id) {
        userRepository.deleteById(id);
        return "User deleted";
    }

    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

   public List<UserDto> getAllUsers() {
    return userRepository.findAll()
        .stream()
        .map(user -> UserDto.toDTO(user))
        .collect(Collectors.toList());
}
private boolean isImageFile(MultipartFile file) {
    String contentType = file.getContentType();
    return contentType != null && contentType.startsWith("image/");
}
public String uploadImage(Long userId, MultipartFile file) throws IOException {
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    if (!isImageFile(file)) {
        throw new IllegalArgumentException("Only image files are allowed.");
    }

    User user = userOptional.get();

    // Use absolute path for reliability
    Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads");
    if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
    }

    String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
    Path filePath = uploadPath.resolve(filename);
    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

    // Save full URL instead of just filename
    String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/uploads/")
            .path(filename)
            .toUriString();

    // Remove old image if exists
    if (user.getImage() != null && !user.getImage().isEmpty()) {
        removeImageFile(user.getImage());
    }

    user.setImage(fileUrl); // Update User entity to store full URL
    userRepository.save(user);

    return fileUrl;
}

public boolean removeImage(Long userId) throws IOException {
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    User user = userOptional.get();

    if (user.getImage() == null || user.getImage().isEmpty()) {
        return false; // No image to remove
    }

    boolean removed = removeImageFile(user.getImage());

    if (removed) {
        user.setImage(null);
        userRepository.save(user);
    }

    return removed;
}

private boolean removeImageFile(String imageUrl) {
    try {
        // Extract filename from URL
        String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

        // Create path to the file
        Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", filename);

        // Delete the file if it exists
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            return true;
        }
        return false;
    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}



}