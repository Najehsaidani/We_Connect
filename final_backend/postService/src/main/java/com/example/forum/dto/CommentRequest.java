package com.example.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    @NotNull(message = "L'ID du post est requis")
    private Long postId;
    
    @NotNull(message = "L'ID de l'utilisateur est requis")
    private Long userId;
    
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String content;
}