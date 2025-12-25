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
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        System.out.println("JwtAuthenticationFilter: Processing request to " + request.getRequestURI());
        System.out.println("JwtAuthenticationFilter: Authorization header = " + authHeader);

        // Check for admin session authentication first
        if (request.getRequestURI().startsWith("/api/admin/") && 
            !request.getRequestURI().equals("/api/admin/login") && 
            !request.getRequestURI().equals("/api/admin/setup") &&
            !request.getRequestURI().equals("/api/admin/test-session") &&
            !request.getRequestURI().equals("/api/admin/test-auth")) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
                Long adminId = (Long) session.getAttribute("adminId");
                if (isAdmin != null && isAdmin && adminId != null) {
                    System.out.println("JwtAuthenticationFilter: Admin session found for admin ID: " + adminId);
                    // Create a simple admin authentication
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        "admin", null, java.util.Collections.emptyList());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    filterChain.doFilter(request, response);
                    return;
                } else {
                    System.out.println("JwtAuthenticationFilter: No valid admin session found");
                }
            } else {
                System.out.println("JwtAuthenticationFilter: No session found for admin request");
            }
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("JwtAuthenticationFilter: Extracted username = " + username);
            } catch (Exception e) {
                System.out.println("JwtAuthenticationFilter: Invalid token");
            }
        } else {
            System.out.println("JwtAuthenticationFilter: No Bearer token found, allowing request to continue");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
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
        } else {
            System.out.println("JwtAuthenticationFilter: No authentication set, allowing anonymous access");
        }
        
        filterChain.doFilter(request, response);
    }
} 