package com.example.forum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivity {
    private Long id;
    private Long userId;
    private String activityType; // POST, POST_LIKE, COMMENT, COMMENT_LIKE
    private Long targetId; // ID du post ou du commentaire concerné
    private String content; // Contenu du post ou du commentaire (si applicable)
    private LocalDateTime createdAt;
    private String targetTitle; // Titre ou extrait du post/commentaire cible
    private Long postId; // ID du post parent (pour les commentaires et likes de commentaires)
}
