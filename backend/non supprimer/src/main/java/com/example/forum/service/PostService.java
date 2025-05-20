package com.example.forum.service;

import com.example.forum.dto.PostRequest;
import com.example.forum.dto.PostResponse;
import com.example.forum.exception.ResourceNotFoundException;
import com.example.forum.model.Post;
import com.example.forum.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j 
public class PostService {
    private final PostRepository postRepository;

    @Transactional
    public PostResponse createPost(PostRequest postRequest) {
        // Validation de la longueur de l'URL
        if (postRequest.getImageUrl() != null && postRequest.getImageUrl().length() > 50000000) {
            throw new IllegalArgumentException("L'URL de l'image est trop longue (max 5000 caractères)");
        }
        
        Post post = Post.builder()
            .author("Utilisateur Actuel")
            .authorAvatar("/placeholder.svg")
            .content(postRequest.getContent())
            .imageUrl(postRequest.getImageUrl())
            .category(postRequest.getCategory())
            .likes(0)
            .comments(0)
            .build();
        
        Post savedPost = postRepository.save(post);
        
        return mapToDto(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByCategory(String category) {
        return postRepository.findByCategory(category)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> searchPosts(String query) {
        return postRepository.findByContentContainingIgnoreCase(query)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé avec l'id: " + id));
        postRepository.delete(post);
    }

    @Transactional
    public PostResponse updatePost(Long id, PostRequest postRequest) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                "Post non trouvé avec l'ID: " + id
            ));
        
        // Mettre à jour les champs modifiables
        post.setContent(postRequest.getContent());
        post.setCategory(postRequest.getCategory());
        if (postRequest.getImageUrl() != null) {
            post.setImageUrl(postRequest.getImageUrl());
        }
        
        // Sauvegarder les modifications
        Post updatedPost = postRepository.save(post);
        
        // Convertir en DTO et retourner
        return mapToDto(updatedPost);
    }

    private PostResponse mapToDto(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .author(post.getAuthor())
                .authorAvatar(post.getAuthorAvatar())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .likes(post.getLikes())
                .comments(post.getComments())
                .category(post.getCategory())
                .createdAt(post.getCreatedAt())
                .build();
    }
}