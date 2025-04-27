package com.User.Useverification.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Request.RegisterRequest;
import com.User.Useverification.Request.ResetPasswordRequest;
import com.User.Useverification.Request.ResetRequest;
import com.User.Useverification.Request.VerifRequest;
import com.User.Useverification.Security.JwtTokenUtil;
import com.User.Useverification.services.UserServices;

@RestController
@RequestMapping("/api/auth")
public class Controller {

    private final UserServices userService;
    private final JwtTokenUtil jwtTokenUtil;

    public Controller(UserServices userService, JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            userService.login(loginRequest);
            String token = jwtTokenUtil.generateToken(loginRequest.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody RegisterRequest registerRequest) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.registerUser(registerRequest);
            response.put("message", "Registration successful. Check your email for OTP.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/send-otp/{email}")
    public ResponseEntity<Map<String, String>> sendOtp(@PathVariable String email) {
        Map<String, String> response = new HashMap<>();
        try {
            boolean isSent = userService.sendOtpForVerification(email);
            if (isSent) {
                response.put("message", "OTP sent successfully.");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "User not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("error", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.resendOtp(email);
            response.put("message", "OTP sent successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyUser(@RequestBody VerifRequest verifRequest) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.verifyUser(verifRequest);
            response.put("message", "Verification successful.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Password reset endpoints

    @PostMapping("/generate-reset-password-token")
    public ResponseEntity<Map<String, String>> generateResetPasswordToken(@RequestParam String email) {
        return userService.generateResetPasswordToken(email);
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<Map<String, String>> validateResetToken(@RequestBody ResetRequest resetRequest) {
        return userService.validateResetToken(resetRequest);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return userService.resetPassword(resetPasswordRequest);
    }
}
