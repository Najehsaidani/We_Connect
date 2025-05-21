package com.example.forum.dto;

import lombok.Data;
import javax.validation.constraints.Size;
import javax.validation.constraints.NotBlank;

@Data
public class PostRequest {
    @NotBlank(message = "Le contenu ne peut pas être vide")
    @Size(max = 10000, message = "Le contenu est trop long")
    private String content;

    @Size(max = 255, message = "Le titre est trop long")
    private String title;

    @Size(max = 255, message = "L'URL de l'image est trop longue")
    private String imageUrl;

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;
}