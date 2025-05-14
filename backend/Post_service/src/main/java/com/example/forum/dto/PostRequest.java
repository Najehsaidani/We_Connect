package com.example.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class PostRequest {
    @NotBlank(message = "Le contenu ne peut pas être vide")
    @Size(max = 500000000, message = "Le contenu ne peut pas dépasser 50000000 caractères")
    private String content;

    @Size(max = 10000000, message = "L'URL de l'image est trop longue")
    private String imageUrl;

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;
}