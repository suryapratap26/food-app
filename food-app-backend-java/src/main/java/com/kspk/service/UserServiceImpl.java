package com.kspk.service;

import com.kspk.Utils.AuthenticationUtil;
import com.kspk.Utils.JwtUtils;
import com.kspk.entity.User;
import com.kspk.DTOs.*;
import com.kspk.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class UserServiceImpl implements UserService {

    private final AuthenticationUtil util;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public UserServiceImpl(AuthenticationUtil util, JwtUtils jwtUtils,
                           UserRepository userRepository, PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.util = util;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }


    @Override
    public UserResponse registerUser(RegisterRequest request) {
        // Ensure role is set correctly (assuming role is a String in User entity based on your code)
        User user = convertToEntity(request, "CUSTOMER");
        userRepository.save(user);
        return convertToUserResponse(user);
    }

    // Admin creation
    public UserResponse createAdmin(RegisterRequest request) {
        User admin = convertToEntity(request, "ADMIN");
        userRepository.save(admin);
        return convertToUserResponse(admin);
    }

    @Override
    public AuthenticationResponse login(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final User user = (User) userDetailsService.loadUserByUsername(request.getEmail());
        final String jwtToken = jwtUtils.generateToken(user);

        // MODIFIED: Return the user's role in the authentication response
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .email(request.getEmail())
                .role(user.getRole()) // Assumes User entity has a getRole() method that returns String
                .build();
    }

    @Override
    public String findByUserId() {
        String loggedInEmail = util.authentication().getName();
        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private User convertToEntity(RegisterRequest request, String role) {
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
    }

    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(),user.getRole());
    }
}
