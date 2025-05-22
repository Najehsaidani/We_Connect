package com.example.forum.service;

import com.example.forum.model.Comment;
import com.example.forum.model.Post;
import com.example.forum.model.UserActivity;
import com.example.forum.repository.CommentRepository;
import com.example.forum.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final CommentService commentService;

    public List<UserActivity> getUserActivities(Long userId) {
        List<UserActivity> activities = new ArrayList<>();

        // Récupérer les posts créés par l'utilisateur
        List<Post> userPosts = postRepository.findByUserId(userId);
        for (Post post : userPosts) {
            activities.add(UserActivity.builder()
                    .id(post.getId())
                    .userId(userId)
                    .activityType("POST")
                    .targetId(post.getId())
                    .content(post.getContent())
                    .createdAt(post.getCreatedAt())
                    .targetTitle(truncateContent(post.getContent(), 50))
                    .build());
        }

        // Récupérer les posts likés par l'utilisateur
        List<Post> allPosts = postRepository.findAll();
        for (Post post : allPosts) {
            if (post.getLikedByUsers().contains(userId)) {
                activities.add(UserActivity.builder()
                        .id(post.getId() + 10000) // Pour éviter les conflits d'ID
                        .userId(userId)
                        .activityType("POST_LIKE")
                        .targetId(post.getId())
                        .createdAt(post.getCreatedAt()) // Approximation, car nous n'avons pas la date exacte du like
                        .targetTitle(truncateContent(post.getContent(), 50))
                        .postId(post.getId())
                        .build());
            }
        }

        // Récupérer les commentaires créés par l'utilisateur
        List<Comment> userComments = commentRepository.findByUserId(userId);
        for (Comment comment : userComments) {
            activities.add(UserActivity.builder()
                    .id(comment.getId() + 20000) // Pour éviter les conflits d'ID
                    .userId(userId)
                    .activityType("COMMENT")
                    .targetId(comment.getId())
                    .content(comment.getContent())
                    .createdAt(comment.getCreatedAt())
                    .targetTitle(truncateContent(comment.getContent(), 50))
                    .postId(comment.getPost().getId())
                    .build());
        }

        // Récupérer les commentaires likés par l'utilisateur
        List<Comment> allComments = commentRepository.findAll();
        for (Comment comment : allComments) {
            if (comment.getLikedByUsers().contains(userId)) {
                activities.add(UserActivity.builder()
                        .id(comment.getId() + 30000) // Pour éviter les conflits d'ID
                        .userId(userId)
                        .activityType("COMMENT_LIKE")
                        .targetId(comment.getId())
                        .createdAt(comment.getCreatedAt()) // Approximation, car nous n'avons pas la date exacte du like
                        .targetTitle(truncateContent(comment.getContent(), 50))
                        .postId(comment.getPost().getId())
                        .build());
            }
        }

        // Trier les activités par date (les plus récentes d'abord)
        return activities.stream()
                .sorted(Comparator.comparing(UserActivity::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    private String truncateContent(String content, int maxLength) {
        if (content == null) {
            return "";
        }
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}
