package com.example.forum.service;

import com.example.forum.dto.UserDTO;
import com.example.forum.model.Comment;
import com.example.forum.model.Post;
import com.example.forum.repository.CommentRepository;
import com.example.forum.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import jakarta.transaction.Transactional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserService userService;

    public Comment createComment(Long postId, Long userId, String content) {
        if (content == null || content.trim().length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le contenu du commentaire doit contenir au moins 3 caractères");
        }

        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
            System.out.println("Post found: " + post.getId());

            // Fetch user data from UserService
            UserDTO user = userService.getUserById(userId);
            System.out.println("User found: " + user.getId());

            Comment comment = Comment.builder()
                    .content(content.trim())
                    .post(post)
                    .userId(userId)
                    .createdAt(LocalDateTime.now())
                    .likes(0)
                    .likedByUsers(new HashSet<>())
                    .build();
            System.out.println("Comment built: " + comment.getContent());

            post.setComments(post.getComments() + 1);
            postRepository.save(post);
            System.out.println("Post updated and saved.");

            Comment savedComment = commentRepository.save(comment);
            System.out.println("Comment saved: " + savedComment.getId());

            return savedComment;
        } catch (ResponseStatusException e) {
            // Re-throw ResponseStatusException as is
            throw e;
        } catch (Exception e) {
            System.err.println("Error creating comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erreur lors de la création du commentaire: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPost_IdOrderByCreatedAtDesc(postId);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    public Comment updateComment(Long id, String content) {
        Comment comment = getCommentById(id);
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        Post post = comment.getPost();
        post.setComments(post.getComments() - 1);
        postRepository.save(post);

        commentRepository.deleteById(id);
    }

    public int getCommentCountForPost(Long postId) {
        return commentRepository.countByPost_Id(postId);
    }

    @Transactional
    public Comment likeComment(Long commentId, Long userId) {
        Comment comment = getCommentById(commentId);

        // Check if user has already liked this comment
        boolean hasLiked = comment.getLikedByUsers().contains(userId);

        if (hasLiked) {
            comment.getLikedByUsers().remove(userId);
            comment.setLikes(comment.getLikes() - 1);
        } else {
            comment.getLikedByUsers().add(userId);
            comment.setLikes(comment.getLikes() + 1);
        }

        return commentRepository.save(comment);
    }
}