/// <reference types="cypress" />

/**
 * Test suite for session-related features.
 * Covers viewing, creating, updating, deleting, and participation for different user roles.
 */
describe('Sessions Management', () => {
  const regularUserEmail = 'user@example.com';
  const adminUserEmail = 'yoga@studio.com';
  const password = 'test!1234';
  const firstSessionId = '1';
  const teacherId = '2'; // Based on the fixture, the teacher_id is 2

  beforeEach(() => {
    // Clear state before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // --- Unauthenticated User Scenarios --- //
  describe('Session Viewing (Unauthenticated)', () => {
    it('should redirect unauthenticated users to login when accessing /sessions', () => {
      cy.visit('/sessions');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users to login when accessing /sessions/detail/:id', () => {
      cy.visit(`/sessions/detail/${firstSessionId}`);
      cy.url().should('include', '/login');
    });
  });

  // --- Regular User Scenarios --- //
  describe('Session Viewing (Regular User)', () => {
    beforeEach(() => {
      // Intercept login request BEFORE login attempt
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 200,
        body: {
          id: 1,
          token: 'fake-jwt-token',
          type: 'Bearer',
          username: regularUserEmail,
          firstName: 'Test',
          lastName: 'User',
          admin: false
        }
      }).as('loginRequest');

      // Intercept session list request
      cy.interceptAPI('GET', 'api/session', 'sessions');

      // Login
      cy.visit('/login');
      cy.get('input[formControlName="email"]').type(regularUserEmail);
      cy.get('input[formControlName="password"]').type(password);
      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Wait for login to complete
      cy.wait('@loginRequest');
      cy.wait('@sessions');

      // Verify redirect to sessions page
      cy.url().should('include', '/sessions');
    });

    it('should display the list of sessions after login', () => {
      cy.get('.mat-card.item').should('have.length.at.least', 1);
      cy.get('.mat-card.item .mat-card-title').first().should('contain.text', 'Yoga Session'); // From fixture
    });

    it('should navigate to session details when clicking a session', () => {
      // Intercept session detail for when we click
      cy.interceptAPI('GET', `api/session/${firstSessionId}`, 'session-detail');
      cy.interceptAPI('GET', `api/teacher/${teacherId}`, 'teachers');

      // Click first session's Detail button
      cy.get('.mat-card.item .mat-card-actions button').first().click();

      // Verify navigation to detail page
      cy.url().should('include', `/sessions/detail/${firstSessionId}`);
      cy.wait('@session-detail');
      cy.wait('@teachers');
      cy.get('h1').should('contain.text', 'Yoga Session'); // From fixture
      cy.get('.description, p.description').should('exist');
    });

    it('should allow a user to participate in a session', () => {
      // Intercept session detail request
      cy.interceptAPI('GET', `api/session/${firstSessionId}`, 'session-detail');
      cy.interceptAPI('GET', `api/teacher/${teacherId}`, 'teachers');

      // Intercept participate request
      cy.intercept('POST', `api/session/${firstSessionId}/participate/1`, {
        statusCode: 200,
        body: {}
      }).as('participate');

      // Visit session detail page
      cy.visit(`/sessions/detail/${firstSessionId}`);
      cy.wait('@session-detail');
      cy.wait('@teachers');

      // Click participate button
      cy.get('button').contains('Participate').click();

      // Verify participation request
      cy.wait('@participate');

      // Button should have changed after participation
      cy.get('button').contains('Do not participate').should('exist');
    });

    it('should allow a user to cancel participation in a session', () => {
      // Intercept session detail with user already participating
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        fixture: 'session-detail.json'
        // The fixture should be updated to include the user ID in the users array
      }).as('sessionDetail');

      cy.interceptAPI('GET', `api/teacher/${teacherId}`, 'teachers');

      // Intercept unparticipate request
      cy.intercept('DELETE', `api/session/${firstSessionId}/participate/1`, {
        statusCode: 200,
        body: {}
      }).as('unparticipate');

      // Visit session detail page
      cy.visit(`/sessions/detail/${firstSessionId}`);
      cy.wait('@sessionDetail');
      cy.wait('@teachers');

      // Click cancel participation button
      cy.get('button').contains('Do not participate').click();

      // Verify request
      cy.wait('@unparticipate');

      // Button should have changed after cancellation
      cy.get('button').contains('Participate').should('exist');
    });
  });

  // --- Admin User Scenarios --- //
  describe('Session Management (Admin)', () => {
    beforeEach(() => {
      // Intercept login request BEFORE login attempt with admin user
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 200,
        body: {
          id: 1,
          token: 'fake-jwt-token',
          type: 'Bearer',
          username: adminUserEmail,
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        }
      }).as('adminLogin');

      // Intercept session list request
      cy.interceptAPI('GET', 'api/session', 'sessions');
      cy.interceptAPI('GET', 'api/teacher', 'teachers');

      // Login as admin
      cy.visit('/login');
      cy.get('input[formControlName="email"]').type(adminUserEmail);
      cy.get('input[formControlName="password"]').type(password);
      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Wait for login and data to load
      cy.wait('@adminLogin');
      cy.wait('@sessions');

      // Verify navigation to sessions page
      cy.url().should('include', '/sessions');
    });

    it('should display admin controls for sessions', () => {
      cy.get('button[routerlink="create"]').should('be.visible');
      cy.get('.mat-card.item button.mat-icon-button, .mat-card.item button[title="Edit"], .mat-card.item button[aria-label="Edit"]').first().should('be.visible');
      cy.get('.mat-card.item button.mat-icon-button, .mat-card.item button[title="Delete"], .mat-card.item button[aria-label="Delete"]').first().should('be.visible');
    });

    it('should allow admin to create a new session', () => {
      // Intercept create session request
      cy.intercept('POST', 'api/session', {
        statusCode: 201,
        body: {
          id: 3,
          name: 'New Yoga Session',
          description: 'New session description',
          date: '2023-03-01T10:00:00.000Z',
          teacher_id: 2,
          users: [],
          createdAt: '2023-01-15T00:00:00.000Z',
          updatedAt: '2023-01-15T00:00:00.000Z'
        }
      }).as('createSession');

      // Navigate to create form
      cy.get('button[routerlink="create"]').click();
      cy.url().should('include', '/sessions/create');

      // Wait for teachers data to load
      cy.wait('@teachers');

      // Fill out the form
      cy.get('input[formControlName="name"]').type('New Yoga Session');
      cy.get('input[formControlName="date"]').type('2023-03-01');
      cy.get('mat-select[formControlName="teacher_id"]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName="description"]').type('New session description');

      // Submit the form
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.wait('@createSession');

      // Verify redirect to sessions list
      cy.url().should('include', '/sessions');
    });

    it('should allow admin to update an existing session', () => {
      // Intercept session detail for the update form
      cy.interceptAPI('GET', `api/session/${firstSessionId}`, 'session-detail');

      // Intercept update session request
      cy.intercept('PUT', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Updated Yoga Session',
          description: 'Updated session description',
          date: '2023-02-15T10:00:00.000Z',
          teacher_id: 2,
          users: [3, 4, 5],
          createdAt: '2022-12-01T00:00:00.000Z',
          updatedAt: '2023-01-20T00:00:00.000Z'
        }
      }).as('updateSession');

      // Find and click the edit button for the first session
      cy.get('.mat-card.item button.mat-icon-button, .mat-card.item button[title="Edit"], .mat-card.item button[aria-label="Edit"]').first().click();

      // Verify navigation to update form
      cy.url().should('include', `/sessions/update/${firstSessionId}`);
      cy.wait('@session-detail');

      // Clear and update form fields
      cy.get('input[formControlName="name"]').clear().type('Updated Yoga Session');
      cy.get('input[formControlName="date"]').clear().type('2023-02-15');
      cy.get('textarea[formControlName="description"]').clear().type('Updated session description');

      // Submit the form
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.wait('@updateSession');

      // Verify redirect to sessions list
      cy.url().should('include', '/sessions');
    });

    it('should allow admin to delete a session', () => {
      // Intercept delete session request
      cy.intercept('DELETE', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {}
      }).as('deleteSession');

      // Re-intercept GET sessions to reflect the updated list after deletion
      cy.intercept('GET', 'api/session', {
        statusCode: 200,
        fixture: 'sessions.json' // This should be modified to have the item removed for this test
      }).as('refreshedSessions');

      // Count initial sessions
      cy.get('.mat-card.item').then($items => {
        const initialCount = $items.length;

        // Find and click the delete button for the first session
        cy.get('.mat-card.item button.mat-icon-button, .mat-card.item button[title="Delete"], .mat-card.item button[aria-label="Delete"]').first().click();

        // Confirm deletion in dialog if there is one
        cy.get('button').contains('OK').click({ force: true });

        // Verify delete request
        cy.wait('@deleteSession');
        cy.wait('@refreshedSessions');

        // Verify session is removed from the list
        cy.get('.mat-card.item').should('have.length', initialCount - 1);
      });
    });
  });

  // --- General Navigation Scenarios --- //
  describe('Session Navigation', () => {
    beforeEach(() => {
      // Intercept login request BEFORE login attempt
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 200,
        body: {
          id: 1,
          token: 'fake-jwt-token',
          type: 'Bearer',
          username: regularUserEmail,
          firstName: 'Test',
          lastName: 'User',
          admin: false
        }
      }).as('loginRequest');

      // Intercept session list request
      cy.interceptAPI('GET', 'api/session', 'sessions');

      // Login
      cy.visit('/login');
      cy.get('input[formControlName="email"]').type(regularUserEmail);
      cy.get('input[formControlName="password"]').type(password);
      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Wait for login to complete
      cy.wait('@loginRequest');
      cy.wait('@sessions');

      // Verify redirect to sessions page
      cy.url().should('include', '/sessions');
    });

    it('should navigate back to sessions list from detail page', () => {
      // Intercept session detail
      cy.interceptAPI('GET', `api/session/${firstSessionId}`, 'session-detail');
      cy.interceptAPI('GET', `api/teacher/${teacherId}`, 'teachers');

      // Navigate to detail page
      cy.visit(`/sessions/detail/${firstSessionId}`);
      cy.wait('@session-detail');
      cy.wait('@teachers');

      // Click back button
      cy.get('button').contains('arrow_back').click();

      // Verify navigation to sessions list
      cy.url().should('include', '/sessions');
    });

    it('should allow logout from sessions page', () => {
      // Click logout button in the nav
      cy.get('span.link').contains('Logout').click();

      // Verify redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});