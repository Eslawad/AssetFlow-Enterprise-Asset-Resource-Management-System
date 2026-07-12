package com.assetflow.controller;

import com.assetflow.model.User;
import com.assetflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    public UserController(UserRepository userRepository) { this.userRepository = userRepository; }

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(userRepository.findAll()); }

    @PatchMapping("/{id}/role") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(User.Role.valueOf(body.get("role")));
        return ResponseEntity.ok(userRepository.save(user));
    }
}
