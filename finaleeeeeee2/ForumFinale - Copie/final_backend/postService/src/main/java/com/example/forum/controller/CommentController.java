package com.example.forum.controller;

import com.example.forum.model.Comment;
import com.example.forum.service.CommentService;
import com.example.forum.service.UserService;
import com.example.forum.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
class CommentDTO {
    private Long id;
    private String content;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long postId;
    private String createdAt;
    private int likes;
    private boolean hasUserLiked;
}

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:5173"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    private CommentDTO mapToDto(Comment comment, Long currentUserId) {
        if (comment == null) {
            return null;
        }

        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUserId(comment.getUserId());

        // Fetch user data from UserService
        try {
            UserDTO user = userService.getUserById(comment.getUserId());
            dto.setUsername(user.getFirstName() + " " + user.getLastName());
            dto.setUserAvatar(user.getImage());
        } catch (Exception e) {
            // If user not found, set default values
            dto.setUsername("Unknown User");
            dto.setUserAvatar("/placeholder.svg");
        }

        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }

        if (comment.getCreatedAt() != null) {
            dto.setCreatedAt(comment.getCreatedAt().toString());
        }

        dto.setLikes(comment.getLikes());
        dto.setHasUserLiked(currentUserId != null &&
                           comment.getLikedByUsers() != null &&
                           comment.getLikedByUsers().contains(currentUserId));

        return dto;
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody(required = false) Map<String, Object> payload) {
        try {
            if (payload == null) {
                return ResponseEntity.badRequest().build();
            }

            if (!payload.containsKey("postId") || !payload.containsKey("userId") || !payload.containsKey("content")) {
                return ResponseEntity.badRequest().build();
            }

            Object postIdObj = payload.get("postId");
            Object userIdObj = payload.get("userId");
            Object contentObj = payload.get("content");

            if (postIdObj == null || userIdObj == null || contentObj == null) {
                return ResponseEntity.badRequest().build();
            }

            Long postId = Long.parseLong(postIdObj.toString());
            Long userId = Long.parseLong(userIdObj.toString());
            String content = contentObj.toString();

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Comment newComment = commentService.createComment(postId, userId, content.trim());
            if (newComment == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            return ResponseEntity.ok(mapToDto(newComment, userId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId, HttpServletRequest request) {
        try {
            if (postId == null) {
                return ResponseEntity.badRequest().build();
            }

            List<Comment> comments = commentService.getCommentsByPostId(postId);
            if (comments == null) {
                return ResponseEntity.notFound().build();
            }

            final Long currentUserId = Optional.ofNullable(request.getParameter("userId"))
                .filter(param -> !param.trim().isEmpty())
                .map(param -> {
                    try {
                        return Long.valueOf(param.trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .orElse(null);

            List<CommentDTO> commentDTOs = comments.stream()
                .map(comment -> mapToDto(comment, currentUserId))
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            return ResponseEntity.ok(commentDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.emptyList());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id, HttpServletRequest request) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().build();
            }

            Comment comment = commentService.getCommentById(id);
            if (comment == null) {
                return ResponseEntity.notFound().build();
            }

            final Long currentUserId = Optional.ofNullable(request.getParameter("userId"))
                .filter(param -> !param.trim().isEmpty())
                .map(param -> {
                    try {
                        return Long.valueOf(param.trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .orElse(null);

            return ResponseEntity.ok(mapToDto(comment, currentUserId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        try {
            String content = payload.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Comment updatedComment = commentService.updateComment(id, content.trim());
            if (updatedComment == null) {
                return ResponseEntity.notFound().build();
            }

            final Long currentUserId = Optional.ofNullable(request.getParameter("userId"))
                .filter(param -> !param.trim().isEmpty())
                .map(param -> {
                    try {
                        return Long.valueOf(param.trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .orElse(null);

            return ResponseEntity.ok(mapToDto(updatedComment, currentUserId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping(value = {"/{id}", "/{id}/"})
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();
        }
    }

    @PostMapping(value = {"/{id}/like", "/{id}/like/"})
    public ResponseEntity<CommentDTO> likeComment(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            if (id == null || userId == null) {
                return ResponseEntity.badRequest().build();
            }
            Comment likedComment = commentService.likeComment(id, userId);
            if (likedComment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(mapToDto(likedComment, userId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Map<String, Integer>> getCommentCount(@PathVariable Long postId) {
        try {
            if (postId == null) {
                return ResponseEntity.badRequest().build();
            }
            int count = commentService.getCommentCountForPost(postId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            Map<String, Integer> errorResponse = new HashMap<>();
            errorResponse.put("count", 0);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }
}