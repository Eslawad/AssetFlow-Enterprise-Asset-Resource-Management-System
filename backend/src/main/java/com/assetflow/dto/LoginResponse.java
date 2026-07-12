package com.assetflow.dto;
public class LoginResponse {
    private String token;
    private String role;
    private String name;
    private Long id;
    public LoginResponse(String token, String role, String name, Long id) { this.token = token; this.role = role; this.name = name; this.id = id; }
    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getName() { return name; }
    public Long getId() { return id; }
}
