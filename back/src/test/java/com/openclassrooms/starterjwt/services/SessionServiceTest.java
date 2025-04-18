package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

// Use MockitoExtension to enable Mockito annotations like @Mock and @InjectMocks
@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    // Create a mock instance of SessionRepository. SessionService depends on this.
    @Mock
    private SessionRepository sessionRepository;

    // Create a mock instance of UserRepository. SessionService also depends on this,
    // although it's not used in the getById method we are testing first.
    // It's good practice to mock all dependencies.
    @Mock
    private UserRepository userRepository;

    // Inject the mocks (sessionRepository, userRepository) into this instance of SessionService.
    // This automatically handles the constructor injection for SessionService.
    @InjectMocks
    private SessionService sessionService;

    private Session mockSession;

    // Setup method to initialize common test data before each test method
    @BeforeEach
    void setUp() {
        mockSession = new Session();
        mockSession.setId(1L);
        mockSession.setName("Yoga Basics");
        mockSession.setDate(new Date());
        mockSession.setDescription("Introduction to Yoga");
    }

    // Test case for the getById method when a session is found
    @Test
    void testGetById_SessionFound() {
        // --- Arrange ---
        // Define the behavior of the mock sessionRepository.
        // When findById with ID 1L is called, return an Optional containing our mockSession.
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));

        // --- Act ---
        // Call the method under test.
        Session result = sessionService.getById(1L);

        // --- Assert ---
        // Verify that the result is not null and is the same as our mockSession.
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Yoga Basics");
        // Verify that the findById method on the mock repository was called exactly once with the argument 1L.
        verify(sessionRepository).findById(1L);
    }

    // Test case for the getById method when a session is not found
    @Test
    void testGetById_SessionNotFound() {
        // --- Arrange ---
        // Define the behavior of the mock sessionRepository.
        // When findById with ID 2L is called, return an empty Optional.
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());

        // --- Act ---
        // Call the method under test.
        Session result = sessionService.getById(2L);

        // --- Assert ---
        // Verify that the result is null, as expected when the session is not found.
        assertThat(result).isNull();
        // Verify that the findById method on the mock repository was called exactly once with the argument 2L.
        verify(sessionRepository).findById(2L);
    }
}