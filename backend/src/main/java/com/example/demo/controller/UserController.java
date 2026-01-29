package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.LoginRequest;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // AJOUT
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // AJOUT

    // Le constructeur injecte automatiquement le Bean PasswordEncoder
    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- INSCRIPTION (Avec hachage) ---
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        // On remplace le mot de passe en clair par sa version hachée
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // --- CONNEXION (Vérification du hachage) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userFound = userRepository.findByEmail(loginRequest.getEmail());

        if (userFound.isPresent()) {
            User user = userFound.get();
            
            // matches(clair, haché) compare le mot de passe saisi avec le hash en DB
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("Mot de passe incorrect");
            }
        } else {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }
    }
}