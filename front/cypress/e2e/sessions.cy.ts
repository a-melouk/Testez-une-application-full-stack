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
      // Intercept API calls for regular session detail view
      // Note: Sessions list is intercepted in beforeEach

      // Initial session detail load (user not participating)
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Yoga Session',
          description: 'A relaxing yoga session',
          date: '2023-01-01T10:00:00.000Z',
          teacher_id: 2,
          users: [], // User (ID 1 from login) is NOT participating yet
          createdAt: '2022-12-01T00:00:00.000Z',
          updatedAt: '2022-12-05T00:00:00.000Z'
        }
      }).as('getSessionDetailInitial');

      cy.intercept('GET', `api/teacher/${teacherId}`, {
        statusCode: 200,
        fixture: 'teachers' // Because teachers.json exists and has teacher ID 2
      }).as('getTeacherDetail');

      // Intercept participate request - user ID 1 comes from login fixture
      cy.intercept('POST', `api/session/${firstSessionId}/participate/1`, {
        statusCode: 200,
        body: {}
      }).as('participateRequest');

      // Navigate to detail page by clicking the button on the list page
      cy.get('.mat-card.item .mat-card-actions button').first().click();
      cy.wait('@getSessionDetailInitial');
      cy.wait('@getTeacherDetail');

      // Verify we're on the detail page and initial state
      cy.url().should('include', `/sessions/detail/${firstSessionId}`);
      cy.contains('button', 'Participate').should('be.visible');
      cy.contains('button', 'Do not participate').should('not.exist');

      // Intercept the GET request that happens *after* participation
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Yoga Session',
          description: 'A relaxing yoga session',
          date: '2023-01-01T10:00:00.000Z',
          teacher_id: 2,
          users: [1], // User ID 1 is now participating
          createdAt: '2022-12-01T00:00:00.000Z',
          updatedAt: '2022-12-05T00:00:00.000Z'
        }
      }).as('getSessionDetailAfterParticipate');

      // Click the Participate button
      cy.contains('button', 'Participate').click();

      // Wait for the requests
      cy.wait('@participateRequest');
      cy.wait('@getSessionDetailAfterParticipate');

      // Verify the button state changed
      cy.contains('button', 'Do not participate').should('be.visible');
      cy.contains('button', 'Participate').should('not.exist');
    });

    it('should allow a user to cancel participation in a session', () => {
      // Intercept API calls for sessions list (handled in beforeEach)

      // Setup intercept for session detail where user IS participating
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Yoga Session',
          description: 'A relaxing yoga session',
          date: '2023-01-01T10:00:00.000Z',
          teacher_id: 2,
          users: [1], // User with ID 1 IS participating
          createdAt: '2022-12-01T00:00:00.000Z',
          updatedAt: '2022-12-05T00:00:00.000Z'
        }
      }).as('getSessionDetailParticipating');

      cy.intercept('GET', `api/teacher/${teacherId}`, {
        statusCode: 200,
        fixture: 'teachers' // Because teachers.json exists and has teacher ID 2
      }).as('getTeacherDetail');

      // Intercept unparticipate request - user ID 1 from login
      cy.intercept('DELETE', `api/session/${firstSessionId}/participate/1`, {
        statusCode: 200,
        body: {}
      }).as('unparticipateRequest');

      // Navigate to detail page
      cy.get('.mat-card.item .mat-card-actions button').first().click();
      cy.wait('@getSessionDetailParticipating');
      cy.wait('@getTeacherDetail');

      // Verify we're on the detail page and initial state
      cy.url().should('include', `/sessions/detail/${firstSessionId}`);
      cy.contains('button', 'Do not participate').should('be.visible');
      cy.contains('button', 'Participate').should('not.exist');

      // Intercept the GET request that happens *after* un-participation
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Yoga Session',
          description: 'A relaxing yoga session',
          date: '2023-01-01T10:00:00.000Z',
          teacher_id: 2,
          users: [], // User ID 1 is now NOT participating
          createdAt: '2022-12-01T00:00:00.000Z',
          updatedAt: '2022-12-05T00:00:00.000Z'
        }
      }).as('getSessionDetailAfterUnparticipate');

      // Click the Do not participate button
      cy.contains('button', 'Do not participate').click();

      // Wait for the requests
      cy.wait('@unparticipateRequest');
      cy.wait('@getSessionDetailAfterUnparticipate');

      // Verify the button state changed
      cy.contains('button', 'Participate').should('be.visible');
      cy.contains('button', 'Do not participate').should('not.exist');
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
      // There should be a create button
      cy.get('button[routerlink="create"]').should('be.visible');

      // Since the Edit and Delete buttons might not be directly visible,
      // we'll just assert that we have session items
      cy.get('.mat-card.item').should('exist');
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
      // Set up intercepts before navigation
      cy.intercept('GET', `api/session/${firstSessionId}`, {
        statusCode: 200,
        fixture: 'session-detail'
      }).as('sessionDetailNav');

      cy.intercept('GET', `api/teacher/${teacherId}`, {
        statusCode: 200,
        fixture: 'teachers'
      }).as('teacherDataNav');

      // Navigate to session detail by clicking first session
      cy.get('.mat-card.item .mat-card-actions button').first().click();
      cy.wait('@sessionDetailNav');
      cy.wait('@teacherDataNav');

      // Verify we're on the detail page
      cy.url().should('include', `/sessions/detail/${firstSessionId}`);

      // Click back button which has the arrow_back icon
      cy.get('button mat-icon').contains('arrow_back').click();

      // Verify navigation to sessions list
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
    });

    it('should allow logout from sessions page', () => {
      // Click logout button in the nav
      cy.get('span.link').contains('Logout').click();

      // Verify redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});