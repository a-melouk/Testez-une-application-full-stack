package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username="testuser", roles={"USER"})
public class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private SessionMapper sessionMapper;

    private Session session1;
    private SessionDto sessionDto1;
    private Teacher teacher1;

    @BeforeEach
    void setUp() {
        teacher1 = new Teacher();
        teacher1.setId(1L);
        teacher1.setFirstName("Test");
        teacher1.setLastName("Test Teacher");

        session1 = Session.builder()
                .id(1L)
                .name("Integration Test Session")
                .date(new Date())
                .description("Session for integration testing")
                .teacher(teacher1)
                .users(Collections.emptyList())
                .build();

        sessionDto1 = new SessionDto(
                1L,
                "Integration Test Session",
                session1.getDate(),
                1L, // teacher_id
                "Session for integration testing",
                Collections.emptyList(),
                null,
                null
        );
    }

    @Test
    void findById_Success() throws Exception {
        // Arrange
        when(sessionService.getById(1L)).thenReturn(session1);
        when(sessionMapper.toDto(session1)).thenReturn(sessionDto1);

        mockMvc.perform(get("/api/session/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is(sessionDto1.getName())));

        verify(sessionService).getById(1L);
        verify(sessionMapper).toDto(session1);
    }

    @Test
    void findById_NotFound() throws Exception {
        // Arrange
        when(sessionService.getById(99L)).thenReturn(null);

        mockMvc.perform(get("/api/session/{id}", 99L))
                .andExpect(status().isNotFound());

        verify(sessionService).getById(99L);
        verify(sessionMapper, never()).toDto(any(Session.class));
    }

    @Test
    void findById_BadRequest_InvalidIdFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/session/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).getById(anyLong());
    }

    @Test
    void findAll_Success() throws Exception {
        // Arrange
        List<Session> sessions = Arrays.asList(session1);
        List<SessionDto> sessionDtos = Arrays.asList(sessionDto1);
        when(sessionService.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is(sessionDto1.getName())));

        verify(sessionService).findAll();
        verify(sessionMapper).toDto(sessions);
    }

    @Test
    void create_Success() throws Exception {
        // Arrange
        SessionDto inputDto = new SessionDto(null, "New Session", new Date(), 1L, "Desc", Collections.emptyList(), null, null);
        Session sessionToCreate = Session.builder().name(inputDto.getName()).date(inputDto.getDate()).description(inputDto.getDescription()).teacher(teacher1).users(Collections.emptyList()).build();
        Session createdSession = Session.builder().id(2L).name(inputDto.getName()).date(inputDto.getDate()).description(inputDto.getDescription()).teacher(teacher1).users(Collections.emptyList()).build();
        SessionDto createdDto = new SessionDto(2L, "New Session", inputDto.getDate(), 1L, "Desc", Collections.emptyList(), null, null);

        when(sessionMapper.toEntity(any(SessionDto.class))).thenReturn(sessionToCreate);
        when(sessionService.create(any(Session.class))).thenReturn(createdSession);
        when(sessionMapper.toDto(any(Session.class))).thenReturn(createdDto);

        // Act & Assert
        mockMvc.perform(post("/api/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.name", is("New Session")));

        verify(sessionMapper).toEntity(any(SessionDto.class));
        verify(sessionService).create(any(Session.class));
        verify(sessionMapper).toDto(any(Session.class));
    }

    @Test
    void update_Success() throws Exception {
        // Arrange
        Long sessionId = 1L;
        SessionDto updateDto = new SessionDto(null, "Updated Session", new Date(), 1L, "Updated Desc", Collections.emptyList(), null, null);
        Session sessionUpdates = Session.builder().name(updateDto.getName()).date(updateDto.getDate()).description(updateDto.getDescription()).teacher(teacher1).build();
        // Service update returns the full updated entity
        Session updatedSession = Session.builder().id(sessionId).name(updateDto.getName()).date(updateDto.getDate()).description(updateDto.getDescription()).teacher(teacher1).users(Collections.emptyList()).build();
        SessionDto updatedDto = new SessionDto(sessionId, "Updated Session", updateDto.getDate(), 1L, "Updated Desc", Collections.emptyList(), null, null);

        when(sessionMapper.toEntity(any(SessionDto.class))).thenReturn(sessionUpdates);
        when(sessionService.update(eq(sessionId), any(Session.class))).thenReturn(updatedSession);
        when(sessionMapper.toDto(any(Session.class))).thenReturn(updatedDto);

        // Act & Assert
        mockMvc.perform(put("/api/session/{id}", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Updated Session")));

        verify(sessionMapper).toEntity(any(SessionDto.class));
        verify(sessionService).update(eq(sessionId), any(Session.class));
        verify(sessionMapper).toDto(any(Session.class));
    }

    @Test
    void update_BadRequest_InvalidIdFormat() throws Exception {
        // Arrange
        SessionDto updateDto = new SessionDto(null, "Update", new Date(), 1L, "Desc", Collections.emptyList(), null, null);

        // Act & Assert
        mockMvc.perform(put("/api/session/{id}", "invalid-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());

        verify(sessionService, never()).update(anyLong(), any(Session.class));
    }

    @Test
    void saveOrDelete_Success() throws Exception {
        // Arrange
        Long sessionId = 1L;
        when(sessionService.getById(sessionId)).thenReturn(session1);
        doNothing().when(sessionService).delete(sessionId);

        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}", sessionId))
                .andExpect(status().isOk());

        verify(sessionService).getById(sessionId);
        verify(sessionService).delete(sessionId);
    }

    @Test
    void saveOrDelete_NotFound() throws Exception {
        // Arrange
        Long sessionId = 99L;
        when(sessionService.getById(sessionId)).thenReturn(null);

        mockMvc.perform(delete("/api/session/{id}", sessionId))
                .andExpect(status().isNotFound());

        verify(sessionService).getById(sessionId);
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    void saveOrDelete_BadRequest_InvalidIdFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());

        // Verify
        verify(sessionService, never()).getById(anyLong());
        verify(sessionService, never()).delete(anyLong());
    }

    @Test
    void participate_Success() throws Exception {
        // Arrange
        Long sessionId = 1L;
        Long userId = 10L;
        // Mock the void participate method
        doNothing().when(sessionService).participate(sessionId, userId);

        // Act & Assert
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId))
                .andExpect(status().isOk());

        verify(sessionService).participate(sessionId, userId);
    }

    @Test
    void participate_BadRequest_InvalidIdFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", "invalid-session-id", 1L))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", 1L, "invalid-user-id"))
                .andExpect(status().isBadRequest());

        // Verify
        verify(sessionService, never()).participate(anyLong(), anyLong());
    }

    @Test
    void noLongerParticipate_Success() throws Exception {
        // Arrange
        Long sessionId = 1L;
        Long userId = 10L;
        // Mock the void noLongerParticipate method
        doNothing().when(sessionService).noLongerParticipate(sessionId, userId);

        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, userId))
                .andExpect(status().isOk());

        verify(sessionService).noLongerParticipate(sessionId, userId);
    }

    @Test
    void noLongerParticipate_BadRequest_InvalidIdFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", "invalid-session-id", 1L))
                .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", 1L, "invalid-user-id"))
                .andExpect(status().isBadRequest());

        // Verify
        verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
    }
}