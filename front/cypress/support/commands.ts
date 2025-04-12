/// <reference types="cypress" />

// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login to the application
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<any>;

    /**
     * Custom command to register a new user
     * @example cy.register('John', 'Doe', 'john@example.com', 'password123')
     */
    register(firstName: string, lastName: string, email: string, password: string): Chainable<any>;

    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<any>;

    /**
     * Custom command to intercept API calls and mock responses
     * @example cy.interceptAPI('GET', '/api/session', 'sessions')
     */
    interceptAPI(method: string, url: string, fixture: string): Chainable<any>;
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[formControlName="email"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').should('not.be.disabled').click();
  cy.url().should('include', '/sessions');
});

// Register command
Cypress.Commands.add('register', (firstName: string, lastName: string, email: string, password: string) => {
  cy.visit('/register');
  cy.get('input[formControlName="firstName"]').type(firstName);
  cy.get('input[formControlName="lastName"]').type(lastName);
  cy.get('input[formControlName="email"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').should('not.be.disabled').click();
  cy.url().should('include', '/login');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('span.link').contains('Logout').click();
  cy.url().should('include', '/');
});

// Intercept API calls and mock responses
Cypress.Commands.add('interceptAPI', (methodInput: string, url: string, fixture: string) => {
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  const method = methodInput as Method;
  cy.intercept(method, url, { fixture: `${fixture}.json` }).as(fixture);
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
