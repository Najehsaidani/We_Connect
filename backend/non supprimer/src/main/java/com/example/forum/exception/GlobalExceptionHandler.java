package com.example.forum.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Internal Server Error");
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));
        
        // Log l'erreur complète
        ex.printStackTrace();
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
// @ControllerAdvice
// public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
//     @ExceptionHandler(ResourceNotFoundException.class)
//     public ResponseEntity<Object> handleResourceNotFoundException(
//             ResourceNotFoundException ex, WebRequest request) {
        
//         Map<String, Object> body = new LinkedHashMap<>();
//         body.put("timestamp", LocalDateTime.now());
//         body.put("message", ex.getMessage());
        
//         return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
//     }

//     @ExceptionHandler(Exception.class)
//     public ResponseEntity<Object> handleGlobalException(
//             Exception ex, WebRequest request) {
        
//         Map<String, Object> body = new LinkedHashMap<>();
//         body.put("timestamp", LocalDateTime.now());
//         body.put("message", "Une erreur est survenue");
//         body.put("details", ex.getMessage());
        
//         return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
// }