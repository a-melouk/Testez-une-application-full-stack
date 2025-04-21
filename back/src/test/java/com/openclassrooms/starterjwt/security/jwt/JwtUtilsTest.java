package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("JWT Utils Unit Tests")
class JwtUtilsTest {

    @InjectMocks
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    private final String jwtSecret = "testSecretKeyForJwtUtilsTest1234567890Test"; // Must be long enough for HS512
    private final int jwtExpirationMs = 3600000;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", jwtSecret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", jwtExpirationMs);
    }

    private UserDetailsImpl createMockUserDetails() {
        return UserDetailsImpl.builder()
                .id(1L)
                .username("testuser@test.com")
                .firstName("Test")
                .lastName("User")
                .admin(false)
                .password("password")
                .build();
    }

    @Nested
    @DisplayName("Token Generation")
    class GenerateTokenTests {

        @Test
        @DisplayName("Should generate a valid JWT token")
        void testGenerateJwtToken() {
            // Arrange
            UserDetailsImpl userDetails = createMockUserDetails();
            when(authentication.getPrincipal()).thenReturn(userDetails);

            // Act
            String token = jwtUtils.generateJwtToken(authentication);

            // Assert
            assertThat(token).isNotNull().isNotEmpty();
            String username = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
            assertThat(username).isEqualTo(userDetails.getUsername());
        }
    }

    @Nested
    @DisplayName("Username Extraction")
    class GetUsernameFromTokenTests {

        @Test
        @DisplayName("Should extract username from a valid token")
        void testGetUserNameFromJwtToken_ValidToken() {
            // Arrange
            UserDetailsImpl userDetails = createMockUserDetails();
            when(authentication.getPrincipal()).thenReturn(userDetails);
            String token = jwtUtils.generateJwtToken(authentication);

            // Act
            String username = jwtUtils.getUserNameFromJwtToken(token);

            // Assert
            assertThat(username).isEqualTo(userDetails.getUsername());
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class ValidateTokenTests {

        private String generateTestToken(String username, Date expiration, String secret) {
           return Jwts.builder()
                   .setSubject(username)
                   .setIssuedAt(new Date())
                   .setExpiration(expiration)
                   .signWith(io.jsonwebtoken.SignatureAlgorithm.HS512, secret)
                   .compact();
        }

        @Test
        @DisplayName("Should return true for a valid token")
        void testValidateJwtToken_Valid() {
            // Arrange
            UserDetailsImpl userDetails = createMockUserDetails();
            when(authentication.getPrincipal()).thenReturn(userDetails);
            String token = jwtUtils.generateJwtToken(authentication);

            // Act
            boolean isValid = jwtUtils.validateJwtToken(token);

            // Assert
            assertTrue(isValid);
        }

        @Test
        @DisplayName("Should return false for an invalid signature")
        void testValidateJwtToken_InvalidSignature() {
            // Arrange
            String token = generateTestToken("user", new Date(System.currentTimeMillis() + jwtExpirationMs), "wrongSecret");

            // Act
            boolean isValid = jwtUtils.validateJwtToken(token);

            // Assert
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for a malformed token")
        void testValidateJwtToken_Malformed() {
            // Arrange
            String token = "this.is.not.a.jwt.token";

            // Act
            boolean isValid = jwtUtils.validateJwtToken(token);

            // Assert
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for an expired token")
        void testValidateJwtToken_Expired() {
             // Arrange
             String token = generateTestToken("user", new Date(System.currentTimeMillis() - 1000), jwtSecret); // Expired 1 second ago

            // Act
            boolean isValid = jwtUtils.validateJwtToken(token);

            // Assert
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for an unsupported token")
        void testValidateJwtToken_Unsupported() {
            // Arrange
             String unsupportedToken = Jwts.builder().setSubject("user").compact(); // Missing signature

            // Act
            boolean isValid = jwtUtils.validateJwtToken(unsupportedToken);

            // Assert
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for an empty claims string token")
        void testValidateJwtToken_EmptyClaims() {
             // Arrange
             String token = "";

             // Assert preliminary check (Jwts parser)
             assertThrows(IllegalArgumentException.class, () -> {
                 Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
             });

             // Act & Assert (JwtUtils method)
             boolean isValid = jwtUtils.validateJwtToken(token);
             assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for a null token")
        void testValidateJwtToken_NullToken() {
            // Assert preliminary check (Jwts parser)
            assertThrows(IllegalArgumentException.class, () -> {
                Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(null);
            });

            // Act & Assert (JwtUtils method)
            boolean isValid = jwtUtils.validateJwtToken(null);
            assertFalse(isValid);
        }
    }
}