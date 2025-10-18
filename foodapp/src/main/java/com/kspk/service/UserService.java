package com.kspk.service;

import com.kspk.DTOs.AuthenticationRequest;
import com.kspk.DTOs.AuthenticationResponse;
import com.kspk.DTOs.RegisterRequest;
import com.kspk.DTOs.UserResponse;
import com.kspk.entity.User;

public interface UserService {
    UserResponse registerUser(RegisterRequest registerRequest);
    public AuthenticationResponse login (AuthenticationRequest request);
    public String findByUserId();
}
