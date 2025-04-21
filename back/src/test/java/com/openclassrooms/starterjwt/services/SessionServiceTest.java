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
import static org.mockito.ArgumentMatchers.anyLong;
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
        // Arrange
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));

        // Act
        Session result = sessionService.getById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Yoga Basics");
        verify(sessionRepository).findById(1L);
    }

    // Test case for the getById method when a session is not found
    @Test
    void testGetById_SessionNotFound() {
        // Arrange
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());

        // Act
        Session result = sessionService.getById(2L);

        // Assert
        assertThat(result).isNull();
        verify(sessionRepository, times(1)).findById(2L);
    }

    // Test case for the create method
    @Test
    void testCreate() {
        // Arrange
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // Create a new session object to pass to the service
        Session sessionToCreate = new Session();
        sessionToCreate.setName("Yoga Basics");
        sessionToCreate.setDate(mockSession.getDate());
        sessionToCreate.setDescription("Introduction to Yoga");

        // Act
        Session result = sessionService.create(sessionToCreate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Yoga Basics");
        verify(sessionRepository, times(1)).save(sessionToCreate);
    }

    // Test case for the delete method
    @Test
    void testDelete() {
        // Arrange
        Long sessionIdToDelete = 1L;

        // Act
        sessionService.delete(sessionIdToDelete);

        // Assert
        verify(sessionRepository, times(1)).deleteById(sessionIdToDelete);
    }

    // Test case for the findAll method
    @Test
    void testFindAll() {
        // Arrange
        List<Session> mockSessionList = Collections.singletonList(mockSession);
        when(sessionRepository.findAll()).thenReturn(mockSessionList);

        // Act
        List<Session> results = sessionService.findAll();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.size()).isEqualTo(1);
        assertThat(results.get(0)).isEqualTo(mockSession);
        verify(sessionRepository, times(1)).findAll();
    }

    // Test case for the update method
    @Test
    void testUpdate() {
        // Arrange
        Long sessionIdToUpdate = 1L;
        Session sessionUpdates = new Session();
        sessionUpdates.setName("Advanced Yoga");
        sessionUpdates.setDescription("Deep dive into Yoga poses");
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

        // Act
        Session result = sessionService.update(sessionIdToUpdate, sessionUpdates);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(sessionIdToUpdate);
        assertThat(result.getName()).isEqualTo("Advanced Yoga");
        assertThat(result.getDescription()).isEqualTo("Deep dive into Yoga poses");
        verify(sessionRepository, times(1)).save(any(Session.class));
    }

    // Test case for the participate method - Success scenario
    @Test
    void testParticipate_Success() {
        // Arrange
        Long sessionId = 1L;
        Long userId = 10L;

        // Ensure the mock session initially has an empty user list for this test
        mockSession.setUsers(new ArrayList<>());

        // Mock repository calls
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // Act
        sessionService.participate(sessionId, userId);

        // Assert
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());

        Session savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getUsers()).contains(mockUser);
    }

    @Test
    void testParticipate_SessionNotFound() {
        // Arrange
        Long sessionId = 2L; // Non-existent session ID
        Long userId = 10L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());
        // Mock userRepository.findById because it's called before the null check in the service
        when(userRepository.findById(userId)).thenReturn(Optional.empty()); // Mocking with the specific userId

        // Act & Assert
        // Expect NotFoundException because sessionRepository.findById returns empty
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        // Verify interactions
        verify(sessionRepository, times(1)).findById(sessionId);
        // Verify userRepository.findById is indeed called once, as per the service logic
        verify(userRepository, times(1)).findById(userId);
        // Verify save is never called when participation fails
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testParticipate_UserNotFound() {
        // Arrange
        Long sessionId = 1L;
        Long userId = 20L; // Use an ID that will not be found for the user

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testParticipate_AlreadyParticipating() {
        // Arrange
        Long sessionId = 1L;
        Long userId = 10L;

        // Add the mock user to the session's user list to simulate they are already participating
        mockSession.setUsers(new ArrayList<>(Collections.singletonList(mockUser)));

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act & Assert
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_Success() {
        // Arrange
        Long sessionId = 1L;
        Long userId = 10L;

        // Create a mutable list and add the user to simulate participation
        List<User> users = new ArrayList<>();
        users.add(mockUser);
        mockSession.setUsers(users);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // Act
        sessionService.noLongerParticipate(sessionId, userId);

        // Assert
        verify(sessionRepository, times(1)).findById(sessionId);
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());

        Session savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getUsers()).doesNotContain(mockUser);
        assertThat(savedSession.getUsers()).isEmpty(); // Since it was the only user
    }

    @Test
    void testNoLongerParticipate_SessionNotFound() {
        // Arrange
        Long sessionId = 2L; // Non-existent session ID
        Long userId = 10L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_UserNotParticipating() {
        // Arrange
        Long sessionId = 1L;
        Long userId = 20L; // User ID that is not in the session's user list

        // Session initially has no users, or users other than userId 20L
        mockSession.setUsers(new ArrayList<>()); // Ensure user list is empty

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));

        // Act & Assert
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_UserNotParticipating_WithOtherUsers() {
        // Arrange
        Long sessionId = 1L;
        Long participatingUserId = 10L; // User who *is* participating
        Long nonParticipatingUserId = 20L; // User who is *not* participating

        // Create a user who is participating
        User participatingUser = new User();
        participatingUser.setId(participatingUserId);

        // Set up the session with the participating user
        List<User> users = new ArrayList<>();
        users.add(participatingUser);
        mockSession.setUsers(users);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));

        // Act & Assert
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, nonParticipatingUserId))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testNoLongerParticipate_Success_WithMultipleUsers() {
        // Arrange
        Long sessionId = 1L;
        Long userIdToRemove = 10L;
        Long remainingUserId = 11L;

        // Create users
        User userToRemove = new User();
        userToRemove.setId(userIdToRemove);
        User remainingUser = new User();
        remainingUser.setId(remainingUserId);

        // Set up the session with both users
        List<User> users = new ArrayList<>(Arrays.asList(userToRemove, remainingUser));
        mockSession.setUsers(users);

        // Mock repository calls
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(mockSession));
        when(sessionRepository.save(any(Session.class))).thenReturn(mockSession);

        // Act
        sessionService.noLongerParticipate(sessionId, userIdToRemove);

        // Assert
        verify(sessionRepository, times(1)).findById(sessionId);
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());

        Session savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getUsers()).containsExactly(remainingUser);
        assertThat(savedSession.getUsers()).doesNotContain(userToRemove);
        assertThat(savedSession.getUsers().size()).isEqualTo(1);
    }
}