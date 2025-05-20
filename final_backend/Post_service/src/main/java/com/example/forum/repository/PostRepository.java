package com.example.forum.repository;

import com.example.forum.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCategory(String category);
    List<Post> findByContentContainingIgnoreCase(String query);
    List<Post> findByAuthorContainingIgnoreCase(String query);
}