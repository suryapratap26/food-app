package com.kspk.service;

import com.kspk.DTOs.AuthenticationRequest;
import com.kspk.DTOs.AuthenticationResponse;
import com.kspk.DTOs.RegisterRequest;
import com.kspk.DTOs.UserResponse;

public interface UserService {

    UserResponse registerUser(RegisterRequest registerRequest);

    AuthenticationResponse login(AuthenticationRequest request);

    String findByUserId();

    UserResponse createAdmin(RegisterRequest registerRequest);
}
