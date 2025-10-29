package com.kspk.DTOs;

import lombok.Data;

@Data
public class ContactRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String message;

}
