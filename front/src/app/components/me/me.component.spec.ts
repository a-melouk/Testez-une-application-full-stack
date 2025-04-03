import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { MeComponent } from './me.component';
import { expect } from '@jest/globals';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { SessionInformation } from '../../interfaces/sessionInformation.interface';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Mock the Element.animate function for JSDOM
if (typeof Element.prototype.animate !== 'function') {
  Element.prototype.animate = jest.fn().mockReturnValue({
    addEventListener: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    cancel: jest.fn(),
    finished: Promise.resolve()
  });
}

describe('MeComponent', () => {
  /**
   * UNIT TESTS
   *
   * These tests use mocks to isolate component functionality
   * and test each method independently.
   */
  describe('Unit Tests', () => {
    let component: MeComponent;
    let fixture: ComponentFixture<MeComponent>;
    let userServiceMock: { getById: jest.Mock, delete: jest.Mock };
    let sessionServiceMock: { sessionInformation: SessionInformation, logOut: jest.Mock };
    let matSnackBarMock: { open: jest.Mock };
    let routerMock: { navigate: jest.Mock };
    let windowSpy: jest.SpyInstance;

    // Mock data for testing
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: '',
      admin: false,
      createdAt: new Date()
    };

    const mockSessionInfo: SessionInformation = {
      id: 1,
      token: 'fake-jwt-token',
      type: 'Bearer',
      username: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    beforeEach(async () => {
      // Create mock objects for all dependencies
      userServiceMock = {
        getById: jest.fn().mockReturnValue(of(mockUser)),
        delete: jest.fn()
      };
      sessionServiceMock = {
        sessionInformation: mockSessionInfo,
        logOut: jest.fn()
      };
      matSnackBarMock = { open: jest.fn() };
      routerMock = { navigate: jest.fn() };

      // Spy on window.history.back
      windowSpy = jest.spyOn(window.history, 'back').mockImplementation(() => { });

      // Configure testing module
      await TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          RouterTestingModule,
          MatCardModule,
          MatSnackBarModule
        ],
        providers: [
          { provide: UserService, useValue: userServiceMock },
          { provide: SessionService, useValue: sessionServiceMock },
          { provide: MatSnackBar, useValue: matSnackBarMock },
          { provide: Router, useValue: routerMock }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add schema to handle custom elements
      }).compileComponents();

      // Create component and detect changes
      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      // Clean up spy
      windowSpy.mockRestore();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load user details on init', () => {
      // Verify that getById was called with the correct ID
      expect(userServiceMock.getById).toHaveBeenCalledWith('1');
      // Verify that user data was assigned correctly
      expect(component.user).toEqual(mockUser);
    });

    // Tests for back() method
    describe('back', () => {
      it('should navigate back in browser history', () => {
        // Call the method
        component.back();
        // Verify window.history.back was called
        expect(windowSpy).toHaveBeenCalled();
      });
    });

    // Tests for delete() method
    describe('delete', () => {
      beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        // Setup delete to return success
        userServiceMock.delete.mockReturnValue(of({}));
      });

      it('should call userService.delete with the correct ID', () => {
        // Call the method
        component.delete();
        // Verify userService.delete was called with correct ID
        expect(userServiceMock.delete).toHaveBeenCalledWith('1');
      });

      it('should show a snackbar notification on successful deletion', () => {
        // Call the method
        component.delete();
        // Verify snackbar was shown with correct message
        expect(matSnackBarMock.open).toHaveBeenCalledWith(
          "Your account has been deleted !",
          'Close',
          { duration: 3000 }
        );
      });

      it('should call sessionService.logOut on successful deletion', () => {
        // Call the method
        component.delete();
        // Verify session logout was called
        expect(sessionServiceMock.logOut).toHaveBeenCalled();
      });

      it('should navigate to home page after successful deletion', () => {
        // Call the method
        component.delete();
        // Verify navigation to home page
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      });

      it('should perform all actions in correct sequence', () => {
        // Track call order
        const calls: string[] = [];

        // Override mock implementations to track sequence
        userServiceMock.delete.mockImplementation(() => {
          calls.push('delete');
          return of({});
        });

        matSnackBarMock.open.mockImplementation(() => {
          calls.push('snackbar');
          return {};
        });

        sessionServiceMock.logOut.mockImplementation(() => {
          calls.push('logout');
        });

        routerMock.navigate.mockImplementation(() => {
          calls.push('navigate');
          return Promise.resolve(true);
        });

        // Call the method
        component.delete();

        // Verify correct sequence of operations
        expect(calls).toEqual(['delete', 'snackbar', 'logout', 'navigate']);
      });
    });
  });

  /**
   * INTEGRATION TESTS
   *
   * These tests use actual services and HttpTestingController
   * to verify interactions between components and services.
   */
  describe('Integration Tests', () => {
    let component: MeComponent;
    let fixture: ComponentFixture<MeComponent>;
    let sessionService: SessionService;
    let httpMock: HttpTestingController;
    let router: Router;
    let snackBar: MatSnackBar;

    // Mock data for testing
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: '',
      admin: false,
      createdAt: new Date()
    };

    const mockSessionInfo: SessionInformation = {
      id: 1,
      token: 'fake-jwt-token',
      type: 'Bearer',
      username: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    beforeEach(async () => {
      // Create router mock
      const routerMock = { navigate: jest.fn() };

      // Configure testing module with real services and HTTP testing
      await TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          HttpClientTestingModule,   // For testing HTTP requests
          MatSnackBarModule,         // For snackbar notifications
          MatCardModule,             // Required for component template
          NoopAnimationsModule       // Use NoopAnimationsModule instead of BrowserAnimationsModule
        ],
        providers: [
          UserService,               // Real UserService
          SessionService,            // Real SessionService
          { provide: Router, useValue: routerMock }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add schema to handle custom elements
      }).compileComponents();

      // Get actual services
      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
      sessionService = TestBed.inject(SessionService);
      httpMock = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);
      snackBar = TestBed.inject(MatSnackBar);

      // Set up the session (required for component initialization)
      sessionService.logIn(mockSessionInfo);

      // Spy on router.navigate and snackBar.open
      jest.spyOn(router, 'navigate');
      jest.spyOn(snackBar, 'open');

      // Initialize component
      fixture.detectChanges();

      // Respond to the HTTP request that ngOnInit makes
      const req = httpMock.expectOne(`api/user/${mockSessionInfo.id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      // Update the view
      fixture.detectChanges();
    });

    afterEach(() => {
      // Verify no outstanding HTTP requests
      httpMock.verify();
    });

    it('should load user data on initialization', () => {
      // Verify user data was loaded correctly
      expect(component.user).toEqual(mockUser);
    });

    it('should delete user account and logout when delete is called', () => {
      // Initial state checks
      expect(sessionService.isLogged).toBe(true);
      expect(sessionService.sessionInformation).toBeTruthy();

      // Call delete method
      component.delete();

      // Verify HTTP delete request was made
      const req = httpMock.expectOne(`api/user/${mockSessionInfo.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({}); // Simulate successful response

      // Verify snackbar notification was shown
      expect(snackBar.open).toHaveBeenCalledWith(
        "Your account has been deleted !",
        'Close',
        { duration: 3000 }
      );

      // Verify user was logged out
      expect(sessionService.isLogged).toBe(false);
      expect(sessionService.sessionInformation).toBeUndefined();

      // Verify navigation to home page
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should go back in history when back is called', () => {
      // Spy on window.history.back
      const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => { });

      // Call back method
      component.back();

      // Verify window.history.back was called
      expect(historySpy).toHaveBeenCalled();

      // Clean up spy
      historySpy.mockRestore();
    });
  });
});
