package com.example.forum.service;

import com.example.forum.dto.PostRequest;
import com.example.forum.dto.PostResponse;
import com.example.forum.dto.UserDTO;
import com.example.forum.dto.CommentResponse;
import com.example.forum.exception.ResourceNotFoundException;
import com.example.forum.model.Post;
import com.example.forum.model.Comment;
import com.example.forum.repository.PostRepository;
import com.example.forum.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    @Transactional
    public PostResponse createPost(PostRequest postRequest, Long userId) {
        // Validation de la longueur de l'URL
        if (postRequest.getImageUrl() != null && postRequest.getImageUrl().length() > 50000000) {
            throw new IllegalArgumentException("L'URL de l'image est trop longue (max 5000 caractères)");
        }

        // Fetch user data from UserService
        UserDTO user = userService.getUserById(userId);

        Post post = Post.builder()
            .userId(userId)
            .authorAvatar(user.getImage() != null ? user.getImage() : "/placeholder.svg")
            .content(postRequest.getContent())
            .imageUrl(postRequest.getImageUrl())
            .category(postRequest.getCategory())
            .likes(0)
            .comments(0)
            .reports(0)
            .build();

        Post savedPost = postRepository.save(post);

        return mapToDto(savedPost, userId);
    }

    @Transactional
    public List<PostResponse> getAllPosts(Long currentUserId) {
        // Handle anonymous user (userId = 0) or null
        Long effectiveUserId = (currentUserId == null || currentUserId == 0) ? null : currentUserId;

        List<Post> posts = postRepository.findAll();

        // Synchroniser le nombre de commentaires pour tous les posts
        posts.forEach(this::synchronizeCommentCount);

        return posts.stream()
                .map(post -> mapToDto(post, effectiveUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PostResponse> getPostsByCategory(String category, Long currentUserId) {
        Long effectiveUserId = (currentUserId == null || currentUserId == 0) ? null : currentUserId;

        List<Post> posts = postRepository.findByCategory(category);

        // Synchroniser le nombre de commentaires pour tous les posts
        posts.forEach(this::synchronizeCommentCount);

        return posts.stream()
                .map(post -> mapToDto(post, effectiveUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<PostResponse> searchPosts(String query, Long currentUserId) {
        Long effectiveUserId = (currentUserId == null || currentUserId == 0) ? null : currentUserId;

        List<Post> posts = postRepository.findByContentContainingIgnoreCase(query);

        // Synchroniser le nombre de commentaires pour tous les posts
        posts.forEach(this::synchronizeCommentCount);

        return posts.stream()
                .map(post -> mapToDto(post, effectiveUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post non trouvé avec l'id: " + id));

        // 1. Clear the post likes relationship (post_likes table)
        post.getLikedByUsers().clear();

        // 2. Clear comment likes relationships (comment_likes table)
        for (Comment comment : post.getCommentList()) {
            // Create a new list to avoid ConcurrentModificationException
            Set<Long> likedByUsersCopy = new HashSet<>(comment.getLikedByUsers());
            for (Long user : likedByUsersCopy) {
                comment.getLikedByUsers().remove(user);
            }
        }

        // Save the changes to ensure all relationships are properly updated in the database
        postRepository.save(post);

        // Now it's safe to delete the post
        // The cascade will handle deleting comments and reports
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
        return mapToDto(updatedPost, post.getUserId());
    }

    @Transactional
    public PostResponse likePost(Long postId, Long userId) {
        if (userId == null || userId == 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vous devez être connecté pour aimer un post");
        }

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post non trouvé"));

        // Verify user exists
        userService.getUserById(userId);

        boolean hasLiked = post.getLikedByUsers().contains(userId);

        if (hasLiked) {
            post.getLikedByUsers().remove(userId);
            post.setLikes(post.getLikes() - 1);
        } else {
            post.getLikedByUsers().add(userId);
            post.setLikes(post.getLikes() + 1);
        }

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost, userId);
    }

    @Transactional(readOnly = true)
    public boolean hasUserLikedPost(Long postId, Long userId) {
        if (userId == null || userId == 0) {
            return false;
        }

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post non trouvé"));

        return post.getLikedByUsers().contains(userId);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, Long userId) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post non trouvé"));

        // Synchroniser le nombre de commentaires avec le nombre réel
        synchronizeCommentCount(post);

        return mapToDto(post, userId);
    }

    @Transactional
    public void synchronizeCommentCount(Post post) {
        // Compter le nombre réel de commentaires pour ce post en utilisant le repository
        int actualCommentCount = commentRepository.countByPost_Id(post.getId());

        // Mettre à jour le champ comments si nécessaire
        if (post.getComments() != actualCommentCount) {
            post.setComments(actualCommentCount);
            postRepository.save(post);
        }
    }

    private PostResponse mapToDto(Post post, Long currentUserId) {
        // Fetch user data from UserService
        UserDTO user = userService.getUserById(post.getUserId());

        boolean hasUserLiked = currentUserId != null && currentUserId != 0 &&
            post.getLikedByUsers().contains(currentUserId);

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .category(post.getCategory())
                .userId(user.getId())
                .username(user.getFirstName() + " " + user.getLastName())
                .authorAvatar(user.getImage())
                .likeCount(post.getLikes())
                .commentCount(post.getComments())
                .reportCount(post.getReports())
                .hasUserLiked(hasUserLiked)
                .comments(post.getCommentList().stream()
                        .map(this::mapCommentToDto)
                        .toList())
                .createdAt(post.getCreatedAt())
                .build();
    }

    private CommentResponse mapCommentToDto(Comment comment) {
        // Fetch user data from UserService
        UserDTO user = userService.getUserById(comment.getUserId());

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(user.getId())
                .username(user.getFirstName() + " " + user.getLastName())
                .userAvatar(user.getImage())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}