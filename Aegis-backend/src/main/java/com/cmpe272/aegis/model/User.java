package com.cmpe272.aegis.model;

import com.cmpe272.aegis.constants.UserRole;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author :37824
 * @description:User entity for database mapping
 * @date :2025/04/16 14:55
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "t_user")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private boolean deleted;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "is_two_factor_enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isTwoFactorEnabled;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}

