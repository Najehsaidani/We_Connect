package com.User.Useverification.Model.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.User.Useverification.Model.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
     Role findByName(String name);
}

