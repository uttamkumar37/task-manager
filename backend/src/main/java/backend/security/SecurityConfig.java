package backend.security;

import backend.model.AppUser;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://task-manager-ashen-nu-54.vercel.app}")
    private String corsAllowedOrigins;

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(getAllowedOrigins());
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                List<String> allowedOrigins = getAllowedOrigins();
                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins.toArray(new String[0]))
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }

    private List<String> getAllowedOrigins() {
        return Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/tasks/**").authenticated()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) ->
                        response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized")))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CommandLineRunner seedDefaultUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.security.username:admin}") String username,
            @Value("${app.security.password:admin123}") String password,
            @Value("${app.security.role:ROLE_USER}") String role
    ) {
        return args -> {
            if (!userRepository.existsByUsername(username)) {
                AppUser user = new AppUser(username, passwordEncoder.encode(password), normalizeRole(role));
                userRepository.save(user);
            }
        };
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) return "ROLE_USER";
        String trimmed = role.trim().toUpperCase();
        return trimmed.startsWith("ROLE_") ? trimmed : "ROLE_" + trimmed;
    }
}
