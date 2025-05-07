package com.User.Useverification.Controller;


import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Request.RegisterRequest;
import com.User.Useverification.Request.ResetPasswordRequest;
import com.User.Useverification.Request.ResetRequest;
import com.User.Useverification.Request.VerifRequest;
import com.User.Useverification.Security.JwtTokenUtil;
import com.User.Useverification.services.TokenBlacklistService;
import com.User.Useverification.services.UserServices;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserServices userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthController(UserServices userService,
                          TokenBlacklistService tokenBlacklistService,
                          JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtTokenUtil = jwtTokenUtil;
        
    }

    // Auth Endpoints

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest);
}

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        return userService.registerUser(registerRequest);
    }

    @GetMapping("/send-otp/{email}")
    public ResponseEntity<?> sendOtp(@PathVariable String email) {
        return ResponseEntity.ok()
                .body(Map.of("success", userService.sendOtpForVerification(email)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        try {
            userService.resendOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifRequest verifRequest) {
        try {
            userService.verifyUser(verifRequest);
            return ResponseEntity.ok(Map.of("message", "Verification successful."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }

    // Password Reset Endpoints

    @PostMapping("/generate-reset-password-token")
    public ResponseEntity<?> generateResetPasswordToken(@RequestParam String email) {
        return userService.generateResetPasswordToken(email);
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestBody ResetRequest resetRequest) {
        return userService.validateResetToken(resetRequest);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return userService.resetPassword(resetPasswordRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        long expiration = jwtTokenUtil.getTokenExpiration(token);
        tokenBlacklistService.addTokenToBlacklist(token, expiration);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

}