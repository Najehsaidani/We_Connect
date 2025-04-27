package com.User.Useverification.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.Model.entity.User;
import com.User.Useverification.Model.repository.UserRepository;
import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Request.RegisterRequest;
import com.User.Useverification.Request.ResetPasswordRequest;
import com.User.Useverification.Request.VerifRequest;
import com.User.Useverification.Request.ResetRequest;
import com.User.Useverification.Response.ResponseUser;
import com.User.Useverification.enums.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServices {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ResponseUser registerUser(RegisterRequest registerRequest) {
        User existingUser = userRepository.findByEmail(registerRequest.getEmail());
        if (existingUser != null && existingUser.isEnable()) {
            throw new RuntimeException("User Already Registered");
        }

        String verificationCode = generateOTP();
        Date verificationExpiry = Date.from(LocalDateTime.now().plusMinutes(5).atZone(ZoneId.systemDefault()).toInstant());

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .numCin(null)
                .phoneNumber(null)
                .dateOfBirth(null)
                .address(null)
                .departement(null)
                .domaine(null)
                .role(Role.ETUDIANT)
                .createdTimestamp(System.currentTimeMillis())
                .enable(false)
                .verificationCode(verificationCode)
                .verificationCodeExpiration(verificationExpiry)
                .build();

        userRepository.save(user);
        sendVerificationEmail(user.getEmail(), verificationCode);

        return new ResponseUser(user.getFirstName(), user.getEmail());
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (user.isEnable()) {
            throw new RuntimeException("User is already verified");
        }

        String verificationCode = generateOTP();
        Date verificationExpiry = Date.from(LocalDateTime.now().plusMinutes(5).atZone(ZoneId.systemDefault()).toInstant());
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiration(verificationExpiry);
        userRepository.save(user);
        sendVerificationEmail(user.getEmail(), verificationCode);
    }

   public ResponseUser login(LoginRequest loginRequest) {
    User existingUser = userRepository.findByEmail(loginRequest.getEmail());
    if (existingUser == null) {
        throw new RuntimeException("User not found");
    }
    if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
        throw new RuntimeException("Invalid password");
    }
    if (!existingUser.isEnable()) {
        throw new RuntimeException("User not verified");
    }

 
    return new ResponseUser(existingUser.getFirstName(), existingUser.getEmail());
}


    public void verifyUser(VerifRequest verifRequest) {
        User user = userRepository.findByEmail(verifRequest.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (user.isEnable()) {
            throw new RuntimeException("User is already verified");
        }
        if (verifRequest.getVerificationCode().equals(user.getVerificationCode())) {
            user.setEnable(true);
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
        user.setEnable(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiration(verificationExpiry);
        userRepository.save(user);
        sendVerificationEmail(user.getEmail(), verificationCode);
        return true;
    }

    // ...existing code...

// 1. Generate and send reset password token
public ResponseEntity<Map<String, String>> generateResetPasswordToken(String email) {
    Map<String, String> response = new HashMap<>();
    User user = userRepository.findByEmail(email);

    if (user == null) {
        response.put("error", "User not found");
        return ResponseEntity.badRequest().body(response);
    }

    String token = generateOTP();
    Date expiry = Date.from(LocalDateTime.now().plusMinutes(10).atZone(ZoneId.systemDefault()).toInstant());
    user.setRestPasswordToken(token);
    user.setResetPasswordTokenExpiration(expiry);
    userRepository.save(user);

    // You can send the token by email
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

// 2. Validate reset token (ResetRequest)
public ResponseEntity<Map<String, String>> validateResetToken(ResetRequest resetRequest) {
    Map<String, String> response = new HashMap<>();
    User user = userRepository.findByEmail(resetRequest.getEmail());

    if (user == null) {
        response.put("error", "User not found");
        return ResponseEntity.badRequest().body(response);
    }
    if (user.getRestPasswordToken() == null || !resetRequest.getResetPasswordToken().equals(user.getRestPasswordToken())) {
        response.put("error", "Invalid or missing reset token");
        return ResponseEntity.badRequest().body(response);
    }
    if (user.getResetPasswordTokenExpiration() == null || new Date().after(user.getResetPasswordTokenExpiration())) {
        response.put("error", "Reset token expired");
        return ResponseEntity.badRequest().body(response);
    }

    response.put("token", user.getRestPasswordToken()); // <-- Add this line
    response.put("message", "Reset token is valid");
    return ResponseEntity.ok(response);
}
// 3. Reset password (ResetPasswordRequest)
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
    user.setRestPasswordToken(null);
    user.setResetPasswordTokenExpiration(null);
    userRepository.save(user);

    response.put("message", "Password reset successful");
    return ResponseEntity.ok(response);
}







    public ResponseEntity<?> updateUser(Long id, UserDto registerRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setNumCin(registerRequest.getNumCin());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setDateOfBirth(registerRequest.getDateOfBirth());
        user.setAddress(registerRequest.getAddress());
        user.setDepartement(registerRequest.getDepartement());
        user.setDomaine(registerRequest.getDomaine());
        user.setRole(registerRequest.getRole());
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
   public List<UserDto> getAllUsers() {
    return userRepository.findAll()
        .stream()
        .map(user -> UserDto.toDTO(user))
        .collect(Collectors.toList());
}
}