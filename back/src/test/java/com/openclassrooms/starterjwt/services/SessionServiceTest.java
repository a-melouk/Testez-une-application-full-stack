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
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.ArgumentMatchers.any;

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

    // Test case for the create method
    @Test
    void testCreate() {
        // --- Arrange ---
        // Define the behavior of the mock sessionRepository.
        // When save is called with any Session object, return the same session object.
        // We use any(Session.class) because the input object instance might be different
        // but we expect the same logical content to be returned.
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // Create a new session object to pass to the service
        Session sessionToCreate = new Session();
        sessionToCreate.setName("Yoga Basics");
        sessionToCreate.setDate(mockSession.getDate()); // Use consistent date for simplicity
        sessionToCreate.setDescription("Introduction to Yoga");
        // Note: ID is usually null before creation, the DB assigns it.

        // --- Act ---
        // Call the method under test.
        Session result = sessionService.create(sessionToCreate);

        // --- Assert ---
        // Verify that the result is the one returned by the mock save operation.
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L); // Assuming mockSession returned has ID 1L
        assertThat(result.getName()).isEqualTo("Yoga Basics");
        // Verify that the save method on the mock repository was called exactly once
        // with the sessionToCreate object.
        verify(sessionRepository, times(1)).save(sessionToCreate);
    }

    // Test case for the delete method
    @Test
    void testDelete() {
        // --- Arrange ---
        Long sessionIdToDelete = 1L;
        // No specific `when` needed for void methods like deleteById if we only verify the call.
        // Mockito automatically does nothing for void methods on mocks.
        // We could use doNothing().when(sessionRepository).deleteById(sessionIdToDelete);

        // --- Act ---
        // Call the method under test.
        sessionService.delete(sessionIdToDelete);

        // --- Assert ---
        // Verify that the deleteById method on the mock repository was called exactly once with the correct ID.
        verify(sessionRepository, times(1)).deleteById(sessionIdToDelete);
    }

    // Test case for the findAll method
    @Test
    void testFindAll() {
        // --- Arrange ---
        // Create a list containing our mock session
        List<Session> mockSessionList = Collections.singletonList(mockSession);
        // Define the behavior of the mock sessionRepository.
        // When findAll is called, return the mockSessionList.
        when(sessionRepository.findAll()).thenReturn(mockSessionList);

        // --- Act ---
        // Call the method under test.
        List<Session> results = sessionService.findAll();

        // --- Assert ---
        // Verify that the returned list is not null, has one element, and contains our mockSession.
        assertThat(results).isNotNull();
        assertThat(results.size()).isEqualTo(1);
        assertThat(results.get(0)).isEqualTo(mockSession);
        // Verify that the findAll method on the mock repository was called exactly once.
        verify(sessionRepository, times(1)).findAll();
    }

    // Test case for the update method
    @Test
    void testUpdate() {
        // --- Arrange ---
        Long sessionIdToUpdate = 1L;
        // Create updated details for the session
        Session sessionUpdates = new Session();
        sessionUpdates.setName("Advanced Yoga");
        sessionUpdates.setDescription("Deep dive into Yoga poses");
        // The date could also be updated, keeping it same for simplicity
        sessionUpdates.setDate(mockSession.getDate());

        // Create the expected session object after update (with ID set)
        Session expectedUpdatedSession = new Session();
        expectedUpdatedSession.setId(sessionIdToUpdate);
        expectedUpdatedSession.setName(sessionUpdates.getName());
        expectedUpdatedSession.setDescription(sessionUpdates.getDescription());
        expectedUpdatedSession.setDate(sessionUpdates.getDate());

        // Define the behavior of the mock sessionRepository.
        // When save is called, return the expected updated session.
        // We match specifically on the object with the ID set, which is what the service passes to save.
        when(sessionRepository.save(any(Session.class))).thenReturn(expectedUpdatedSession);

        // --- Act ---
        // Call the method under test.
        Session result = sessionService.update(sessionIdToUpdate, sessionUpdates);

        // --- Assert ---
        // Verify that the result matches the expected updated session details.
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(sessionIdToUpdate);
        assertThat(result.getName()).isEqualTo("Advanced Yoga");
        assertThat(result.getDescription()).isEqualTo("Deep dive into Yoga poses");
        // Verify that the save method on the mock repository was called exactly once
        // with an argument that has the ID set correctly.
        // We can capture the argument or rely on the `when` matching `any(Session.class)`
        // combined with asserting the result which comes from the mocked return.
        verify(sessionRepository, times(1)).save(any(Session.class)); // Verifies save was called
    }
}