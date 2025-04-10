/// <reference types="cypress" />

/**
 * This test file implements a complete user flow through the application.
 * It uses our custom commands to perform key operations.
 */
describe('Complete User Flow', () => {
  const randomEmail = `user_${Date.now()}@example.com`;

  beforeEach(() => {
    // Clear any previous user session
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow a user to register, login, view sessions, and logout', () => {
    // Setup interceptors
    cy.interceptAPI('POST', 'api/auth/register', 'empty');
    cy.interceptAPI('POST', 'api/auth/login', 'login-response');
    cy.interceptAPI('GET', 'api/session', 'sessions');
    cy.interceptAPI('GET', 'api/teacher/*', 'teachers');

    // Register
    cy.register('Test', 'User', randomEmail, 'test!1234');

    // Login
    cy.login(randomEmail, 'test!1234');

    // Verify sessions page is displayed
    cy.url().should('include', '/sessions');
    cy.get('.item').should('have.length.at.least', 1);

    // Logout
    cy.logout();

    // Verify redirect to home page
    cy.url().should('eq', 'http://localhost:4200/');
  });

  it('should allow an admin to create and manage sessions', () => {
    // Setup interceptors for admin login
    cy.intercept('POST', 'api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        token: 'fake-jwt-token',
        type: 'Bearer',
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      }
    }).as('adminLogin');

    // Mock session endpoints
    cy.interceptAPI('GET', 'api/session', 'sessions');
    cy.interceptAPI('GET', 'api/teacher', 'teachers');
    cy.intercept('POST', 'api/session', {
      statusCode: 201,
      body: {
        id: 3,
        name: 'Flow Test Session',
        description: 'Created in flow test',
        date: '2023-02-01T10:00:00.000Z',
        teacher_id: 2,
        users: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }).as('createSession');

    // Login as admin with correct credentials
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('yoga@studio.com');
    cy.get('input[formControlName="password"]').type('test!1234');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@adminLogin');

    // Verify the application navigated to the sessions page automatically
    cy.url().should('include', '/sessions');

    // Wait for the sessions data to load before interacting with the page
    cy.wait('@sessions');

    // Create a new session using the correct selector
    cy.get('button[routerlink="create"]').click();
    cy.url().should('include', '/sessions/create');

    // Wait for teachers if needed
    cy.wait('@teachers');

    // Fill out the form
    cy.get('input[formControlName="name"]').type('Flow Test Session');
    cy.get('input[formControlName="date"]').type('2023-02-01');
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName="description"]').type('Created in flow test');

    // Submit the form, ensuring button is enabled
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@createSession');

    // Verify redirect to sessions list
    cy.url().should('include', '/sessions');
  });

  it('should use custom commands to simplify test code', () => {
    // Using our custom command to intercept the API
    cy.interceptAPI('POST', 'api/auth/login', 'login-response');
    cy.interceptAPI('GET', 'api/session', 'sessions');

    // Using our custom command to login
    cy.login('yoga@studio.com', 'test!1234');

    // Verify we are on the sessions page
    cy.url().should('include', '/sessions');

    // Using our custom command to logout
    cy.logout();

    // Verify we are logged out
    cy.url().should('eq', 'http://localhost:4200/');
  });
});