package com.User.Useverification.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void addTokenToBlacklist(String token, long expirationTimeMillis) {
        blacklist.put(token, expirationTimeMillis);
    }

    public boolean isTokenBlacklisted(String token) {
        Long expiration = blacklist.get(token);
        if (expiration == null) return false;
        if (System.currentTimeMillis() > expiration) {
            blacklist.remove(token); // Clean up expired token
            return false;
        }
        return true;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}