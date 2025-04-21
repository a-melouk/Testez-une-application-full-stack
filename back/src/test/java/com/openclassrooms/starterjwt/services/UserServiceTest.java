package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private final Long userId = 1L;
    private final Long nonExistentUserId = 99L;


    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(userId);
        user.setEmail("test@test.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("password");
        user.setAdmin(false);
    }

    @Nested
    @DisplayName("Find By ID")
    class FindByIdTests {

        @Test
        @DisplayName("Should return user when found")
        void testFindById_UserFound() {
            // Arrange
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            // Act
            User foundUser = userService.findById(userId);

            // Assert
            assertThat(foundUser).isEqualTo(user);
            verify(userRepository).findById(userId);
        }

        @Test
        @DisplayName("Should return null when user not found")
        void testFindById_UserNotFound() {
            // Arrange
            when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

            // Act
            User foundUser = userService.findById(nonExistentUserId);

            // Assert
            assertThat(foundUser).isNull();
            verify(userRepository).findById(nonExistentUserId);
        }
    }

    @Nested
    @DisplayName("Delete User")
    class DeleteTests {

        @Test
        @DisplayName("Should call repository deleteById")
        void testDelete() {
            // Arrange (None)

            // Act
            userService.delete(userId);

            // Assert
            verify(userRepository).deleteById(userId);
        }

        @Test
        @DisplayName("Should call repository deleteById even if user does not exist")
        void testDelete_NonExistentUser() {
            // Arrange
            // No specific arrangement needed, deleteById doesn't throw if ID not found

            // Act
            userService.delete(nonExistentUserId);

            // Assert
            verify(userRepository).deleteById(nonExistentUserId);
        }
    }
}