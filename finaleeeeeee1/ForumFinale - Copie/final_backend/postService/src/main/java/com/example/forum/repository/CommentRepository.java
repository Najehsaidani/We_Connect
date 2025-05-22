package com.example.forum.repository;

import com.example.forum.model.Comment;
import com.example.forum.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
    List<Comment> findByPost_IdOrderByCreatedAtDesc(Long postId);
    int countByPost_Id(Long postId);
    List<Comment> findByUserId(Long userId);
}