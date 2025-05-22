package com.User.Useverification.services.Interface;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.User.Useverification.Model.DTO.ProfileUpdateDTO;
import com.User.Useverification.Model.DTO.UserDto;
import com.User.Useverification.Request.ChangePasswordRequest;
import com.User.Useverification.Request.LoginRequest;
import com.User.Useverification.Request.RegisterRequest;
import com.User.Useverification.Request.ResetPasswordRequest;
import com.User.Useverification.Request.ResetRequest;
import com.User.Useverification.Request.VerifRequest;

public interface UserServices {
    ResponseEntity<?> registerUser(RegisterRequest registerRequest);
    void resendOtp(String email);
    ResponseEntity<?> login(LoginRequest loginRequest);
    void verifyUser(VerifRequest verifRequest);
    ResponseEntity<Map<String, String>> generateResetPasswordToken(String email);
    ResponseEntity<Map<String, String>> validateResetToken(ResetRequest resetRequest);
    ResponseEntity<Map<String, String>> resetPassword(ResetPasswordRequest resetPasswordRequest);
    ResponseEntity<Map<String, String>> changePassword(Long userId, ChangePasswordRequest changePasswordRequest);
    ResponseEntity<?> updateUser(Long id, ProfileUpdateDTO userDto);
    String deleteUser(Long id);
    List<UserDto> getAllUsers();
    String uploadImage(Long userId, MultipartFile file) throws IOException;
    boolean removeImage(Long userId) throws IOException;
    // Add other methods like getUser, getUserByEmail if needed
}