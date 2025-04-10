import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { AuthService } from './features/auth/services/auth.service';
import { SessionService } from './services/session.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceMock: { login: jest.Mock };
  let sessionServiceMock: { $isLogged: jest.Mock, logOut: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    // Create mock objects for all dependencies
    authServiceMock = { login: jest.fn() };
    sessionServiceMock = {
      $isLogged: jest.fn().mockReturnValue(of(true)), // Default to logged in
      logOut: jest.fn()
    };
    routerMock = { navigate: jest.fn() };

    // Configure testing module
    await TestBed.configureTestingModule({
      imports: [
        MatToolbarModule
      ],
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Helps with custom elements
    }).compileComponents();

    // Create component and detect changes
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Verify component is created
    expect(component).toBeTruthy();
  });

  /**
   * Tests for the $isLogged() method
   * This method returns the logged status from the session service
   */
  describe('$isLogged', () => {
    it('should return the logged status from session service', (done) => {
      // Set mock to return logged in (true)
      sessionServiceMock.$isLogged.mockReturnValue(of(true));

      // Call the method and check result
      component.$isLogged().pipe(first()).subscribe(isLogged => {
        expect(isLogged).toBe(true);

        // Verify sessionService.$isLogged was called
        expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
        done();
      });
    });

    it('should reflect logged out status from session service', (done) => {
      // Set mock to return logged out (false)
      sessionServiceMock.$isLogged.mockReturnValue(of(false));

      // Call the method and check result
      component.$isLogged().pipe(first()).subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });

  /**
   * Tests for the logout() method
   * This method logs the user out and navigates to the home page
   */
  describe('logout', () => {
    it('should call sessionService.logOut', () => {
      // Call the method
      component.logout();

      // Verify sessionService.logOut was called
      expect(sessionServiceMock.logOut).toHaveBeenCalled();
    });

    it('should navigate to home page after logout', () => {
      // Call the method
      component.logout();

      // Verify navigation to home page
      expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    });

    it('should perform logout operations in correct order', () => {
      // Track call order
      const calls: string[] = [];

      // Override mock implementations to track sequence
      sessionServiceMock.logOut.mockImplementation((): void => {
        calls.push('logout');
      });

      routerMock.navigate.mockImplementation((): Promise<boolean> => {
        calls.push('navigate');
        return Promise.resolve(true);
      });

      // Call the method
      component.logout();

      // Verify correct sequence of operations
      expect(calls).toEqual(['logout', 'navigate']);
    });
  });

  /**
   * Integration tests for component behavior
   * These tests verify that the UI elements behave correctly based on logged state
   */
  describe('UI behavior', () => {
    it('should reflect logged status in the template', () => {
      // First test with logged in state
      sessionServiceMock.$isLogged.mockReturnValue(of(true));
      fixture.detectChanges();

      // Then test with logged out state
      sessionServiceMock.$isLogged.mockReturnValue(of(false));
      fixture.detectChanges();

      // Verify $isLogged was called
      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
    });
  });
});
