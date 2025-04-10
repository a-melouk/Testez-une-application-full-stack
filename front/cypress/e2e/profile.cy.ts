describe('User Profile', () => {
  // Mock user data
  const mockLoginData = {
    id: 1,
    token: 'fake-jwt-token',
    type: 'Bearer',
    username: 'yoga@studio.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  const mockUserData = {
    id: 1,
    email: 'yoga@studio.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    // Clear any previous user session
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock login API with correct username
    cy.intercept('POST', 'api/auth/login', {
      statusCode: 200,
      body: mockLoginData
    }).as('login');

    // Login as regular user with correct credentials
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('yoga@studio.com');
    cy.get('input[formControlName="password"]').type('test!1234');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
  });

  it('should display user profile information', () => {
    // Mock user profile API with correct ID (assuming user ID is 1 from login)
    cy.intercept('GET', 'api/user/1', {
      statusCode: 200,
      body: mockUserData
    }).as('getUser');

    // Navigate to me page using correct selector
    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser');

    // Verify profile information is displayed
    cy.get('mat-card-content').should('exist');
    cy.get('mat-card-content').should('contain', 'Test USER');
    cy.get('mat-card-content').should('contain', 'yoga@studio.com');
  });

  it('should allow a user to delete their account', () => {
    // Mock user profile API with correct ID
    cy.intercept('GET', 'api/user/1', {
      statusCode: 200,
      body: mockUserData
    }).as('getUser');

    // Mock delete account API with correct ID
    cy.intercept('DELETE', 'api/user/1', {
      statusCode: 200,
      body: {}
    }).as('deleteUser');

    // Navigate to me page using correct selector
    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser');

    // Look for the section that says "Delete my account:" and then find the button below it
    cy.contains('p', 'Delete my account:').should('exist');

    // Click on the delete button which has the text "Detail" (according to the HTML)
    cy.get('button[mat-raised-button][color="warn"]').contains('Detail').click();
    cy.wait('@deleteUser');

    // Verify redirect to home page
    cy.url().should('eq', 'http://localhost:4200/');

    // Verify user is logged out (logout link should not be visible)
    cy.get('span.link').contains('Logout').should('not.exist');
  });

  it('should allow navigation back from profile page', () => {
    // Mock user profile API with correct ID
    cy.intercept('GET', 'api/user/1', {
      statusCode: 200,
      body: mockUserData
    }).as('getUser');

    // Navigate to me page using correct selector
    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser');

    // Click back button
    cy.get('button[mat-icon-button]').first().click();

    // Verify redirect to previous page (sessions)
    cy.url().should('include', '/sessions');
  });
});