package com.bookbridge.config;

import com.bookbridge.config.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.GET, "/books/**").permitAll() // allow file serving first
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll() // allow file serving first
                .requestMatchers(HttpMethod.GET, "/api/books", "/api/books/**").permitAll() // legacy public GET
                .requestMatchers(HttpMethod.GET, "/api/v1/books", "/api/v1/books/**").permitAll() // new versioned books GET
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/login", "/api/register/**", "/api/password/reset", "/api/password/reset/complete").permitAll()
                .requestMatchers("/api/admin/**").permitAll() // Allow all admin endpoints - authentication handled manually
                .requestMatchers("/api/cart/**").authenticated() // Allow cart endpoints for authenticated users
                .requestMatchers("/api/orders/**").authenticated() // Allow orders endpoints for authenticated users
                .requestMatchers(HttpMethod.POST, "/api/books").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/books/request").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}