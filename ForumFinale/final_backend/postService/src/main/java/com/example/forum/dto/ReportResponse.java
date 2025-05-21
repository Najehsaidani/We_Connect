package com.example.forum.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private String reason;
    private String status;

    // Informations de l'utilisateur qui signale
    private Long userId;
    private String username;
    private String userAvatar;

    // Informations du post signalé
    private Long postId;
    private String postContent;
    private String postAuthor;
    private String postAuthorAvatar;
    private String postImageUrl;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}