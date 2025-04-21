package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // Ensure using test profile (e.g., H2 database)
@WithMockUser // Mock a user for security context
class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Teacher teacher1;
    private Teacher teacher2;

    @BeforeEach
    void setUp() {
        // Clean up before each test
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();

        // Setup initial data
        teacher1 = Teacher.builder()
                .lastName("DELAHAYE")
                .firstName("Margot")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teacher2 = Teacher.builder()
                .lastName("THIERCELIN")
                .firstName("Hélène")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teacher1 = teacherRepository.save(teacher1);
        teacher2 = teacherRepository.save(teacher2);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    void testFindById_TeacherFound() throws Exception {
        // Act & Assert
        MvcResult result = mockMvc.perform(get("/api/teacher/{id}", teacher1.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        TeacherDto responseDto = objectMapper.readValue(jsonResponse, TeacherDto.class);

        assertThat(responseDto.getId()).isEqualTo(teacher1.getId());
        assertThat(responseDto.getLastName()).isEqualTo(teacher1.getLastName());
        assertThat(responseDto.getFirstName()).isEqualTo(teacher1.getFirstName());
    }

    @Test
    void testFindById_TeacherNotFound() throws Exception {
        // Arrange
        Long nonExistentId = 999L;

        // Act & Assert
        mockMvc.perform(get("/api/teacher/{id}", nonExistentId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testFindById_InvalidIdFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/teacher/{id}", "invalid-id")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testFindAll() throws Exception {
        // Act & Assert
        MvcResult result = mockMvc.perform(get("/api/teacher")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();
        List<TeacherDto> responseDtos = objectMapper.readValue(jsonResponse, new TypeReference<List<TeacherDto>>() {});

        assertThat(responseDtos).hasSize(2);
        assertThat(responseDtos).extracting(TeacherDto::getId).containsExactlyInAnyOrder(teacher1.getId(), teacher2.getId());
        assertThat(responseDtos).extracting(TeacherDto::getLastName).containsExactlyInAnyOrder(teacher1.getLastName(), teacher2.getLastName());
    }
}