package com.cmpe272.aegis.constants;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 14:55
 */

public enum UserRole {
    ADMIN(0),
    MANAGER(1),
    USER(2);


    private final int role;
    UserRole(int role) {
        this.role = role;
    }

    public int getRole() {
        return role;
    }
}

