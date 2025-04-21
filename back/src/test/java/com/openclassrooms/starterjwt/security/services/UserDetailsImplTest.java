package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Unit Tests for UserDetailsImpl")
class UserDetailsImplTest {

    private UserDetailsImpl userDetails1;
    private UserDetailsImpl userDetails1Copy;
    private UserDetailsImpl userDetails2;

    @BeforeEach
    void setUp() {
        userDetails1 = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("Test")
                .lastName("User")
                .admin(false)
                .password("password")
                .build();

        userDetails1Copy = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com") // Content same as userDetails1
                .firstName("Test")
                .lastName("User")
                .admin(false)
                .password("password")
                .build();

        userDetails2 = UserDetailsImpl.builder()
                .id(2L)
                .username("another@example.com")
                .firstName("Another")
                .lastName("Tester")
                .admin(true)
                .password("anotherpassword")
                .build();
    }

    @Test
    @DisplayName("Getters should return correct values")
    void testGetters() {
        assertThat(userDetails1.getId()).isEqualTo(1L);
        assertThat(userDetails1.getUsername()).isEqualTo("test@example.com");
        assertThat(userDetails1.getFirstName()).isEqualTo("Test");
        assertThat(userDetails1.getLastName()).isEqualTo("User");
        assertThat(userDetails1.getAdmin()).isFalse();
        assertThat(userDetails1.getPassword()).isEqualTo("password");
    }

    @Test
    @DisplayName("getAuthorities should return an empty collection")
    void testGetAuthorities() {
        Collection<? extends GrantedAuthority> authorities = userDetails1.getAuthorities();
        assertThat(authorities).isNotNull();
        assertThat(authorities).isEmpty();
    }

    @Test
    @DisplayName("Account status methods should return true")
    void testAccountStatusMethods() {
        assertThat(userDetails1.isAccountNonExpired()).isTrue();
        assertThat(userDetails1.isAccountNonLocked()).isTrue();
        assertThat(userDetails1.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails1.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("equals should return true for the same object")
    void equals_shouldReturnTrue_forSameObject() {
        assertThat(userDetails1.equals(userDetails1)).isTrue();
    }

    @Test
    @DisplayName("equals should return true for objects with the same ID")
    void equals_shouldReturnTrue_forObjectsWithSameId() {
        assertThat(userDetails1.equals(userDetails1Copy)).isTrue();
    }

    @Test
    @DisplayName("equals should return false for objects with different IDs")
    void equals_shouldReturnFalse_forObjectsWithDifferentIds() {
        assertThat(userDetails1.equals(userDetails2)).isFalse();
    }

    @Test
    @DisplayName("equals should return false for null object")
    void equals_shouldReturnFalse_forNullObject() {
        assertThat(userDetails1.equals(null)).isFalse();
    }

    @Test
    @DisplayName("equals should return false for object of different type")
    void equals_shouldReturnFalse_forDifferentType() {
        Object otherObject = new Object();
        assertThat(userDetails1.equals(otherObject)).isFalse();
    }

    @Test
    @DisplayName("hashCode consistency with equals")
    void testHashCode() {
        assertThat(userDetails1.hashCode()).isEqualTo(userDetails1Copy.hashCode());
        assertThat(userDetails1.hashCode()).isNotEqualTo(userDetails2.hashCode());
    }
}