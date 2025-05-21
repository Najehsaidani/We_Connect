package com.example.forum.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private String imageUrl;
    private String category;
    
    // Informations de l'utilisateur
    private Long userId;
    private String username;
    private String authorAvatar;
    
    // Statistiques
    private int likeCount;
    private int commentCount;
    private int reportCount;
    private boolean hasUserLiked;
    
    // Liste des commentaires (optionnel, à charger sur demande)
    private List<CommentResponse> comments;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}