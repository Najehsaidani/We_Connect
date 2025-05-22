package com.example.forum.client;

import com.example.forum.model.UserActivity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "forum-api", url = "${forum.api.url:http://localhost:8082}")
public interface UserActivityClient {
    @GetMapping("/api/user-activities/{userId}")
    List<UserActivity> getUserActivities(@PathVariable("userId") Long userId);
}
