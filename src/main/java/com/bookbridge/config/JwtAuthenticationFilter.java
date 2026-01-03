package com.bookbridge.config;

import com.bookbridge.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import jakarta.servlet.http.HttpSession;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        System.out.println("JwtAuthenticationFilter: Processing request to " + requestURI);
        System.out.println("JwtAuthenticationFilter: Authorization header = " + authHeader);

        // Check for admin session authentication first
        if (requestURI.startsWith("/api/admin/") &&
                !requestURI.equals("/api/admin/login") &&
                !requestURI.equals("/api/admin/setup") &&
                !requestURI.equals("/api/admin/test-session") &&
                !requestURI.equals("/api/admin/test-auth")) {

            HttpSession session = request.getSession(false);
            if (session != null) {
                Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
                Long adminId = (Long) session.getAttribute("adminId");
                if (isAdmin != null && isAdmin && adminId != null) {
                    System.out.println("JwtAuthenticationFilter: Admin session found for admin ID: " + adminId);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            "admin", null, java.util.Collections.emptyList());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("JwtAuthenticationFilter: No valid admin session found");
                }
            } else {
                System.out.println("JwtAuthenticationFilter: No session found for admin request");
            }
        }

        // Process JWT if present (for non-public endpoints)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("JwtAuthenticationFilter: Extracted username = " + username);
            } catch (Exception e) {
                System.out.println("JwtAuthenticationFilter: Invalid token: " + e.getMessage());
                // Don't throw error, just continue without authentication
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    System.out.println("JwtAuthenticationFilter: Token valid, setting authentication for " + username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("JwtAuthenticationFilter: Token invalid for " + username);
                }
            } catch (Exception e) {
                System.out.println("JwtAuthenticationFilter: Error loading user details: " + e.getMessage());
                // Continue without authentication
            }
        }

        System.out.println("JwtAuthenticationFilter: Continuing filter chain");
        filterChain.doFilter(request, response);
    }
}