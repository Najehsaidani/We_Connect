package com.User.Useverification.services.Interface;

public interface RoleService {
    /**
     * Assigns a single role to a user.
     * 
     * @param userId   the ID of the user
     * @param roleName the name of the role to assign
     * @throws RuntimeException if the user or role is not found
     */
    void setUserSingleRole(Long userId, String roleName);

    /**
     * Retrieves the role of a user.
     * 
     * @param userId the ID of the user
     * @return the name of the user's role, or "No role" if none is assigned
     * @throws RuntimeException if the user is not found
     */
    String getUserRole(Long userId);
}