package com.kspk.controller;

import com.kspk.DTOs.*;
import com.kspk.service.EmailService;
import com.kspk.service.UserService;

import lombok.AllArgsConstructor;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
   private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create")
    public ResponseEntity<UserResponse> createAdmin(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createAdmin(request));
    }
    @PostMapping("/contact")
public ResponseEntity<String> handleContactForm(@RequestBody ContactRequest contactRequest) {
    String subject = "📩 New Contact Form Submission";
    String text = "You received a new contact message:\n\n"
            + "Name: " + contactRequest.getFirstName() + " " + contactRequest.getLastName() + "\n"
            + "Email: " + contactRequest.getEmail() + "\n"
            + "Message:\n" + contactRequest.getMessage() + "\n\n"
            + "— From your website";

    emailService.sendEmail("your_email@gmail.com", subject, text);

    return ResponseEntity.ok("Message sent successfully!");
}

}
