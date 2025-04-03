import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { first } from 'rxjs/operators';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  // Mock session information for testing
  const mockSessionInfo: SessionInformation = {
    id: 1,
    token: 'fake-jwt-token',
    type: 'Bearer',
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(() => {
    // Configure the testing module
    TestBed.configureTestingModule({});
    // Inject the service
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    // Basic test to ensure the service was created
    expect(service).toBeTruthy();
  });

  /**
   * Tests for the $isLogged() method
   * This method returns an Observable of the logged state
   */
  describe('$isLogged', () => {
    it('should return an Observable of the logged state', (done) => {
      // Initial state should be false when service is first created
      service.$isLogged().pipe(first()).subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });

    it('should reflect changes to logged state', (done) => {
      // This test verifies that the observable emits new values when the state changes
      // Set up a subscription to track changes
      let loggedStates: boolean[] = [];

      const subscription = service.$isLogged().subscribe(isLogged => {
        loggedStates.push(isLogged);

        // After we've collected 3 values (initial, after login, after logout)
        if (loggedStates.length === 3) {
          // Values should be: false (initial) -> true (after login) -> false (after logout)
          expect(loggedStates).toEqual([false, true, false]);
          subscription.unsubscribe();
          done();
        }
      });

      // Trigger state changes by calling logIn and logOut methods
      service.logIn(mockSessionInfo);
      service.logOut();
    });
  });

  /**
   * Tests for the logIn() method
   * This method updates the session information and sets isLogged to true
   */
  describe('logIn', () => {
    it('should update sessionInformation', () => {
      // Call the method with mock data
      service.logIn(mockSessionInfo);
      // Verify sessionInformation was updated correctly
      expect(service.sessionInformation).toEqual(mockSessionInfo);
    });

    it('should set isLogged to true', () => {
      // Call the method with mock data
      service.logIn(mockSessionInfo);
      // Verify isLogged flag was set to true
      expect(service.isLogged).toBe(true);
    });

    it('should emit the updated logged state', (done) => {
      // First check the initial state
      service.$isLogged().pipe(first()).subscribe(isLogged => {
        expect(isLogged).toBe(false);

        // Then log in and check the updated state
        service.logIn(mockSessionInfo);

        service.$isLogged().pipe(first()).subscribe(updatedIsLogged => {
          // Verify isLogged was updated to true
          expect(updatedIsLogged).toBe(true);
          done();
        });
      });
    });
  });

  /**
   * Tests for the logOut() method
   * This method clears session information and sets isLogged to false
   */
  describe('logOut', () => {
    beforeEach(() => {
      // Log in first to test logout functionality
      service.logIn(mockSessionInfo);
    });

    it('should clear sessionInformation', () => {
      // Verify we start with session information
      expect(service.sessionInformation).toBeTruthy();

      // Call the logout method
      service.logOut();

      // Verify session information was cleared
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should set isLogged to false', () => {
      // Verify we start logged in
      expect(service.isLogged).toBe(true);

      // Call the logout method
      service.logOut();

      // Verify isLogged was set to false
      expect(service.isLogged).toBe(false);
    });

    it('should emit the updated logged state', (done) => {
      // Confirm we start logged in
      service.$isLogged().pipe(first()).subscribe(isLogged => {
        expect(isLogged).toBe(true);

        // Then log out and check the updated state
        service.logOut();

        service.$isLogged().pipe(first()).subscribe(updatedIsLogged => {
          // Verify isLogged was updated to false
          expect(updatedIsLogged).toBe(false);
          done();
        });
      });
    });
  });

  /**
   * Integration tests for the complete login/logout flow
   * These tests verify that all functionality works together correctly
   */
  describe('Integration', () => {
    it('should maintain correct state through login/logout cycle', (done) => {
      // Initial state check
      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();

      // Check the observable initial state
      service.$isLogged().pipe(first()).subscribe(initialIsLogged => {
        expect(initialIsLogged).toBe(false);

        // Log in and verify state after login
        service.logIn(mockSessionInfo);

        // State after login
        expect(service.isLogged).toBe(true);
        expect(service.sessionInformation).toEqual(mockSessionInfo);

        // Check the observable state after login
        service.$isLogged().pipe(first()).subscribe(loggedInState => {
          expect(loggedInState).toBe(true);

          // Log out and verify state after logout
          service.logOut();

          // State after logout
          expect(service.isLogged).toBe(false);
          expect(service.sessionInformation).toBeUndefined();

          // Check the observable state after logout
          service.$isLogged().pipe(first()).subscribe(loggedOutState => {
            expect(loggedOutState).toBe(false);
            done();
          });
        });
      });
    });
  });
});
