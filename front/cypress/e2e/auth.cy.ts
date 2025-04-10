/// <reference types="cypress" />

describe('Authentication flows', () => {
  beforeEach(() => {
    // Clear any previous user session
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Registration', () => {
    it('should allow a user to register', () => {
      // Mock API registration endpoint
      cy.intercept('POST', 'api/auth/register', {
        statusCode: 200,
        body: {}
      }).as('register');

      // Visit register page
      cy.visit('/register');

      // Verify form exists and title is correct
      cy.get('form').should('exist');
      cy.get('mat-card-title').should('contain', 'Register');

      // Fill out form
      cy.get('input[formControlName="firstName"]').type('John');
      cy.get('input[formControlName="lastName"]').type('Doe');
      cy.get('input[formControlName="email"]').type('john.doe@example.com');
      cy.get('input[formControlName="password"]').type('password123');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for API call
      cy.wait('@register').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123'
        });
      });

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });

    it('should show validation errors for invalid inputs', () => {
      cy.visit('/register');

      // Verify submit button is disabled initially
      cy.get('button[type="submit"]').should('be.disabled');

      // --- Test required validation by focus/blur ---
      const fields = ['firstName', 'lastName', 'email', 'password'];
      fields.forEach(field => {
        // Check required validator by focusing and blurring
        cy.get(`input[formControlName="${field}"]`).focus().blur();
        // Assert that the parent form field is marked invalid (which triggers red label)
        cy.get(`input[formControlName="${field}"]`).closest('mat-form-field')
          .should('have.class', 'mat-form-field-invalid');
        cy.get('button[type="submit"]').should('be.disabled'); // Button should remain disabled
      });

      // --- Test invalid email format ---
      // Fill other fields validly first
      cy.get('input[formControlName="firstName"]').type('John');
      cy.get('input[formControlName="lastName"]').type('Doe');
      cy.get('input[formControlName="password"]').type('password123');

      // Type invalid email format
      cy.get('input[formControlName="email"]').type('invalid-email');

      // Assert that the email parent form field is marked invalid
      cy.get('input[formControlName="email"]').closest('mat-form-field')
        .should('have.class', 'mat-form-field-invalid');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should handle registration errors from the server', () => {
      // Mock API registration endpoint with error
      cy.intercept('POST', 'api/auth/register', {
        statusCode: 400,
        body: 'Email already exists'
      }).as('registerError');

      cy.visit('/register');

      // Fill out form
      cy.get('input[formControlName="firstName"]').type('John');
      cy.get('input[formControlName="lastName"]').type('Doe');
      cy.get('input[formControlName="email"]').type('existing@example.com');
      cy.get('input[formControlName="password"]').type('password123');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for API call
      cy.wait('@registerError');

      // Check if error is displayed
      cy.get('.error').should('exist');
      cy.get('.error').should('be.visible');
    });
  });

  describe('Login', () => {
    it('should allow a user to login', () => {
      // Mock API login endpoint
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 200,
        body: {
          id: 1,
          token: 'fake-jwt-token',
          type: 'Bearer',
          username: 'yoga@studio.com',
          firstName: 'Yoga',
          lastName: 'User',
          admin: false
        }
      }).as('login');

      // Visit login page and use correct credentials
      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('yoga@studio.com');
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Wait for API call
      cy.wait('@login').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          email: 'yoga@studio.com',
          password: 'test!1234'
        });
      });

      // Verify redirect to sessions page
      cy.url().should('include', '/sessions');
    });

    it('should show validation errors for invalid inputs', () => {
      cy.visit('/login');

      // Verify submit button is disabled initially
      cy.get('button[type="submit"]').should('be.disabled');

      // --- Test required validation by focus/blur ---
      const fields = ['email', 'password'];
      fields.forEach(field => {
        // Check required validator by focusing and blurring
        cy.get(`input[formControlName="${field}"]`).focus().blur();
        // Assert that the parent form field is marked invalid
        cy.get(`input[formControlName="${field}"]`).closest('mat-form-field')
          .should('have.class', 'mat-form-field-invalid');
        cy.get('button[type="submit"]').should('be.disabled'); // Button should remain disabled
      });

      // --- Test invalid email format ---
      // Fill password validly first
      cy.get('input[formControlName="password"]').type('password123');

      // Type invalid email format
      cy.get('input[formControlName="email"]').type('invalid-email');

      // Assert that the email parent form field is marked invalid
      cy.get('input[formControlName="email"]').closest('mat-form-field')
        .should('have.class', 'mat-form-field-invalid');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should handle login errors from the server', () => {
      // Mock API login endpoint with error
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 401,
        body: 'Invalid credentials' // Simulate wrong credentials response
      }).as('loginError');

      cy.visit('/login');

      // Fill out form with *valid format* but *incorrect* credentials
      cy.get('input[formControlName="email"]').type('wrong@example.com');
      cy.get('input[formControlName="password"]').type('wrongpassword');

      // Assert button becomes enabled after typing valid formats
      cy.get('button[type="submit"]').should('not.be.disabled');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for API call
      cy.wait('@loginError');

      // Check if error message is displayed correctly
      cy.get('p.error').should('exist');
      cy.get('p.error').should('be.visible');
      cy.get('p.error').should('contain', 'An error occurred');
    });
  });

  describe('Logout', () => {
    it('should allow a user to logout', () => {
      // First login with correct credentials
      cy.intercept('POST', 'api/auth/login', {
        statusCode: 200,
        body: {
          id: 1,
          token: 'fake-jwt-token',
          type: 'Bearer',
          username: 'yoga@studio.com',
          firstName: 'Yoga',
          lastName: 'User',
          admin: false
        }
      }).as('login');

      cy.visit('/login');
      cy.get('input[formControlName="email"]').type('yoga@studio.com');
      cy.get('input[formControlName="password"]').type('test!1234');
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.wait('@login');

      // Now logout using the custom command
      cy.logout();

      // Verify redirect to home page
      cy.url().should('eq', 'http://localhost:4200/');
    });
  });
});