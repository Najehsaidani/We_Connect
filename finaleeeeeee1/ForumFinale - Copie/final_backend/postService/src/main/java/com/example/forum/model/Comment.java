package com.example.forum.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Size(min = 1, message = "Le contenu du commentaire doit contenir au moins 1 caractères")
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String content;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties({"user", "comments", "reports", "likedByUsers"})
    private Post post;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "likes", nullable = false)
    @Builder.Default
    private Integer likes = 0;

    @ElementCollection
    @CollectionTable(
        name = "comment_likes",
        joinColumns = @JoinColumn(name = "comment_id")
    )
    @Column(name = "user_id")
    @Builder.Default
    private Set<Long> likedByUsers = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}