package backend.controller;

import backend.dto.AuthResponseDTO;
import backend.dto.LoginRequestDTO;
import backend.dto.RegisterRequestDTO;
import backend.model.AppUser;
import backend.repository.UserRepository;
import backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO registerRequest) {
        String username = registerRequest.getUsername();
        String password = registerRequest.getPassword();

        if (isBlank(username) || isBlank(password)) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDTO("Username and password are required", null, null));
        }

        String normalizedUsername = username.trim();
        if (userRepository.existsByUsername(normalizedUsername)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponseDTO("Username already exists", null, null));
        }

        AppUser user = new AppUser(normalizedUsername, passwordEncoder.encode(password), "ROLE_USER");
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponseDTO("Registration successful", normalizedUsername, "ROLE_USER"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        if (isBlank(username) || isBlank(password)) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDTO("Username and password are required", null, null));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            String token = jwtUtil.generateToken(authentication.getName());
            String role  = firstRole(authentication);

            return ResponseEntity.ok(
                    new AuthResponseDTO("Login successful", authentication.getName(), role, token));

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO("Invalid username or password", null, null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout() {
        // JWT is stateless — client removes the token from localStorage
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new AuthResponseDTO("Logout successful", null, null));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDTO> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO("Unauthorized", null, null));
        }
        return ResponseEntity.ok(
                new AuthResponseDTO("Authenticated user", authentication.getName(), firstRole(authentication)));
    }

    private String firstRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
