package com.placify.api.repository;

import com.placify.api.model.Role;
import com.placify.api.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
    long countByRole(Role role);
    long countByRoleAndActive(Role role, boolean active);
}
