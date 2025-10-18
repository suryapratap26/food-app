package com.kspk.service;

import com.kspk.Utils.AuthenticationUtil;
import com.kspk.Utils.JwtUtils;
import com.kspk.entity.User;
import com.kspk.DTOs.AuthenticationRequest;
import com.kspk.DTOs.AuthenticationResponse;
import com.kspk.DTOs.RegisterRequest;
import com.kspk.DTOs.UserResponse;
import com.kspk.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements  UserService{

    private final AuthenticationUtil util;
    private final JwtUtils jwtUtils;
    private final   UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;


    public UserServiceImpl(AuthenticationUtil util, JwtUtils jwtUtils, UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.util = util;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder= passwordEncoder;
        this.authenticationManager=authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public UserResponse registerUser(RegisterRequest request) {
        User user=userRepository.save(converToEntity(request));

        return converToUserResponse(user);
    }

    public AuthenticationResponse login (AuthenticationRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(),request.getPassword()));
      final  UserDetails userDetails=userDetailsService.loadUserByUsername(request.getEmail());
        final String JwtToken=jwtUtils.generateToken(userDetails);
        return AuthenticationResponse.builder()
                .token(JwtToken)
                .email(request.getEmail())
                .build();
    }

    @Override
    public String findByUserId() {
       String loggedInEmail= util.authentication().getName();
    User user=   userRepository.findByEmail(loggedInEmail).orElseThrow((()->new RuntimeException("user not found")));
    return user.getId();
    }

    private User converToEntity(RegisterRequest request){
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
    }
    private UserResponse converToUserResponse(User user){
        return new UserResponse(user.getId(), user.getEmail(), user.getPassword());
    }
}
