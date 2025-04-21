package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    private User mockUser;

    // Setup method to initialize common test data before each test method
    @BeforeEach
    void setUp() {
        mockSession = new Session();
        mockSession.setId(1L);
        mockSession.setName("Yoga Basics");
        mockSession.setDate(new Date());
        mockSession.setDescription("Introduction to Yoga");
        mockSession.setUsers(new ArrayList<>());

        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setFirstName("John");
        mockUser.setLastName("Doe");
        mockUser.setEmail("john.doe@test.com");
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
        verify(sessionRepository, times(1)).findById(2L);
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

    // Test case for the participate method - Success scenario
    @Test
    void testParticipate_Success() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userId = 10L;

        // Ensure the mock session initially has an empty user list for this test
        mockSession.setUsers(new ArrayList<>());

        // Mock repository calls
        // cReate a session instance and then manipulate
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        // Mock the save operation
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // --- Act ---
        sessionService.participate(sessionId, userId);

        // --- Assert ---
        // Verify repository methods were called

        // Can use any instead of sessionId
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        // Capture the argument passed to save
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository,times(1)).save(sessionCaptor.capture());
        // Check that the saved session now contains the user
        Session savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getUsers()).isNotNull();
        assertThat(savedSession.getUsers()).contains(mockUser);
        assertThat(savedSession.getUsers().size()).isEqualTo(1);
    }

    // Test case for the participate method - Session Not Found
    @Test
    void testParticipate_SessionNotFound() {
        // --- Arrange ---
        Long sessionId = 99L; // Non-existent session ID
        Long userId = 10L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());
        // We still need to mock the user repository call, even though we expect
        // the session check to fail first, because the code executes both finds
        // before checking for null.
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser)); // Or Optional.empty(), result doesn't matter here

        // --- Act & Assert ---
        // Verify that calling participate throws NotFoundException
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        // Verify findById was called for session
        verify(sessionRepository).findById(sessionId);
        // Verify findById was ALSO called for user, as per the code logic
        verify(userRepository).findById(userId);
        // Verify save was not called
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Test case for the participate method - User Not Found
    @Test
    void testParticipate_UserNotFound() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userId = 99L; // Non-existent user ID

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // --- Act & Assert ---
        // Verify that calling participate throws NotFoundException
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        // Verify findById methods were called but save was not
        verify(sessionRepository).findById(sessionId);
        verify(userRepository).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Test case for the participate method - Already Participating
    @Test
    void testParticipate_AlreadyParticipating() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userId = 10L;

        // Add the user to the mock session's list beforehand
        mockSession.getUsers().add(mockUser);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // --- Act & Assert ---
        // Verify that calling participate throws BadRequestException
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);

        // Verify findById methods were called but save was not
        verify(sessionRepository).findById(sessionId);
        verify(userRepository).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // --- Tests for noLongerParticipate ---

    @Test
    void testNoLongerParticipate_Success() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userId = 10L;

        // Setup mockSession with the user initially participating
        mockSession.setUsers(new ArrayList<>(Arrays.asList(mockUser))); // Use modifiable list

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        // No need to mock userRepository.findById for noLongerParticipate

        // Mock the save operation
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // --- Act ---
        sessionService.noLongerParticipate(sessionId, userId);

        // --- Assert ---
        // Verify repository methods were called
        verify(sessionRepository, times(1)).findById(sessionId);

        // Capture the argument passed to save
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());

        // Check that the saved session no longer contains the user
        Session savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getUsers()).isNotNull();
        assertThat(savedSession.getUsers()).doesNotContain(mockUser);
        assertThat(savedSession.getUsers()).isEmpty(); // Assuming only one user initially
    }

    @Test
    void testNoLongerParticipate_SessionNotFound() {
        // --- Arrange ---
        Long sessionId = 99L; // Non-existent session ID
        Long userId = 10L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        // --- Act & Assert ---
        // Verify that calling noLongerParticipate throws NotFoundException
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        // Verify findById was called for session
        verify(sessionRepository).findById(sessionId);
        // Verify save was not called
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_UserNotParticipating() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userId = 10L; // User ID exists but is not in the session

        // Setup mockSession without the user
        mockSession.setUsers(new ArrayList<>()); // Empty list

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));

        // --- Act & Assert ---
        // Verify that calling noLongerParticipate throws BadRequestException
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);

        // Verify findById was called for session
        verify(sessionRepository).findById(sessionId);
        // Verify save was not called
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_UserNotParticipating_WithOtherUsers() {
        // --- Arrange ---
        Long sessionId = 1L;
        Long userIdToRemove = 10L; // This user is NOT in the list

        // Create another user who IS in the list
        User existingUser = new User();
        existingUser.setId(20L);
        existingUser.setEmail("existing@test.com");

        // Setup mockSession with only the existingUser
        mockSession.setUsers(new ArrayList<>(Arrays.asList(existingUser)));

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));

        // --- Act & Assert ---
        // Verify that calling noLongerParticipate for userIdToRemove throws BadRequestException
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userIdToRemove))
                .isInstanceOf(BadRequestException.class);

        // Verify findById was called for session
        verify(sessionRepository).findById(sessionId);
        // Verify save was not called
        verify(sessionRepository, never()).save(any(Session.class));
    }

     @Test
     void testNoLongerParticipate_Success_WithMultipleUsers() {
         // --- Arrange ---
         Long sessionId = 1L;
         Long userIdToRemove = 10L; // User to remove (mockUser)

         // Create other users
         User user2 = new User(); user2.setId(20L); user2.setEmail("user2@test.com");
         User user3 = new User(); user3.setId(30L); user3.setEmail("user3@test.com");

         // Setup mockSession with multiple users initially
         mockSession.setUsers(new ArrayList<>(Arrays.asList(user2, mockUser, user3))); // Use modifiable list

         when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
         when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

         // --- Act ---
         sessionService.noLongerParticipate(sessionId, userIdToRemove);

         // --- Assert ---
         verify(sessionRepository, times(1)).findById(sessionId);
         ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
         verify(sessionRepository, times(1)).save(sessionCaptor.capture());

         // Check the saved session contains only the remaining users
         Session savedSession = sessionCaptor.getValue();
         assertThat(savedSession.getUsers())
                 .isNotNull()
                 .hasSize(2)
                 .containsExactlyInAnyOrder(user2, user3) // Check remaining users
                 .doesNotContain(mockUser); // Verify removed user is gone
     }
}