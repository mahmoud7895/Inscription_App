package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA va créer la requête SQL automatiquement !
    Optional<User> findByEmail(String email);
}