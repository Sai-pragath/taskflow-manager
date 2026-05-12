package com.taskmanager.controller;

import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.service.UserService;
import com.taskmanager.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));

            String token = jwtUtil.generateToken(request.getEmail());
            var user = userService.findByEmail(request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid email or password"
            ));
        }
    }
}
