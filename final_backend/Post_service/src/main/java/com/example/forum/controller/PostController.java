package com.example.forum.controller;

import com.example.forum.dto.PostRequest;
import com.example.forum.dto.PostResponse;
import com.example.forum.service.PostService;
import com.example.forum.service.FileStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:8081") // Add CORS configuration here
public class PostController {
    private final PostService postService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
        @RequestBody @Valid PostRequest postRequest,
        BindingResult bindingResult) {
        
        if (bindingResult.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                bindingResult.getAllErrors().get(0).getDefaultMessage()
            );
        }
        
        try {
            PostResponse response = postService.createPost(postRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la création du post: " + e.getMessage()
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
        @PathVariable Long id, 
        @RequestBody @Valid PostRequest postRequest,
        BindingResult bindingResult) {
        
        if (bindingResult.hasErrors()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                bindingResult.getAllErrors().get(0).getDefaultMessage()
            );
        }
        
        try {
            PostResponse updatedPost = postService.updatePost(id, postRequest);
            return ResponseEntity.ok(updatedPost);
        } catch (ResponseStatusException e) {
            throw e; // Rethrow ResponseStatusException as is
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Erreur lors de la mise à jour du post: " + e.getMessage()
            );
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PostResponse>> getPostsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(postService.getPostsByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostResponse>> searchPosts(@RequestParam String query) {
        return ResponseEntity.ok(postService.searchPosts(query));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}