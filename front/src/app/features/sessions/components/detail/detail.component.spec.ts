import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { DetailComponent } from './detail.component';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionApiServiceMock: { detail: jest.Mock, delete: jest.Mock, participate: jest.Mock, unParticipate: jest.Mock };
  let teacherServiceMock: { detail: jest.Mock };
  let sessionServiceMock: { sessionInformation: SessionInformation };
  let matSnackBarMock: { open: jest.Mock };
  let routerMock: { navigate: jest.Mock };
  let windowSpy: jest.SpyInstance;

  // Mock data for testing
  const mockSessionId = '1';
  const mockUserId = '2';

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2023-01-01T10:00:00'),
    teacher_id: 3,
    users: [2, 4, 5], // Note: includes mockUserId (2)
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2022-12-05')
  };

  const mockTeacher: Teacher = {
    id: 3,
    lastName: 'Smith',
    firstName: 'John',
    createdAt: new Date('2022-11-01'),
    updatedAt: new Date('2022-11-05')
  };

  const mockSessionInfo: SessionInformation = {
    id: 2, // Same as mockUserId
    token: 'fake-jwt-token',
    type: 'Bearer',
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: true // User is admin
  };

  beforeEach(async () => {
    // Create mock objects for all dependencies
    sessionApiServiceMock = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      delete: jest.fn().mockReturnValue(of({})),
      participate: jest.fn().mockReturnValue(of(undefined)),
      unParticipate: jest.fn().mockReturnValue(of(undefined))
    };

    teacherServiceMock = {
      detail: jest.fn().mockReturnValue(of(mockTeacher))
    };

    sessionServiceMock = {
      sessionInformation: mockSessionInfo
    };

    matSnackBarMock = { open: jest.fn() };
    routerMock = { navigate: jest.fn() };

    // Spy on window.history.back
    windowSpy = jest.spyOn(window.history, 'back').mockImplementation(() => { });

    // Create mock for ActivatedRoute
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(mockSessionId)
        }
      }
    };

    // Configure testing module
    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MatSnackBar, useValue: matSnackBarMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Helps with custom elements
    }).compileComponents();

    // Create component and detect changes
    fixture = TestBed.createComponent(DetailComponent);
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

  /**
   * Tests for component initialization
   */
  describe('initialization', () => {
    it('should initialize with correct session ID from route', () => {
      // Verify sessionId was set from route params
      expect(component.sessionId).toBe(mockSessionId);
    });

    it('should initialize admin status from session service', () => {
      // Verify isAdmin was set from session information
      expect(component.isAdmin).toBe(true);
    });

    it('should initialize user ID from session service', () => {
      // Verify userId was set from session information
      expect(component.userId).toBe('2');
    });

    it('should fetch session details on init', () => {
      // Verify sessionApiService.detail was called with correct ID
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith(mockSessionId);

      // Verify session was set
      expect(component.session).toEqual(mockSession);
    });

    it('should fetch teacher details after session is loaded', () => {
      // Verify teacherService.detail was called with teacher_id from session
      expect(teacherServiceMock.detail).toHaveBeenCalledWith(mockSession.teacher_id.toString());

      // Verify teacher was set
      expect(component.teacher).toEqual(mockTeacher);
    });

    it('should determine if user is participating in the session', () => {
      // User ID 2 is in the session's users array
      expect(component.isParticipate).toBe(true);

      // Test with a session where user is not participating
      const nonParticipatingSession = { ...mockSession, users: [4, 5] };
      sessionApiServiceMock.detail.mockReturnValue(of(nonParticipatingSession));

      // Re-fetch session
      component.ngOnInit();

      expect(component.isParticipate).toBe(false);
    });
  });

  /**
   * Tests for the back() method
   */
  describe('back', () => {
    it('should navigate back in browser history', () => {
      // Call the method
      component.back();

      // Verify window.history.back was called
      expect(windowSpy).toHaveBeenCalled();
    });
  });

  /**
   * Tests for the delete() method
   */
  describe('delete', () => {
    it('should call sessionApiService.delete with correct ID', () => {
      // Call the method
      component.delete();

      // Verify sessionApiService.delete was called with correct ID
      expect(sessionApiServiceMock.delete).toHaveBeenCalledWith(mockSessionId);
    });

    it('should show a snackbar notification on successful deletion', () => {
      // Call the method
      component.delete();

      // Verify snackbar was shown with correct message
      expect(matSnackBarMock.open).toHaveBeenCalledWith(
        'Session deleted !',
        'Close',
        { duration: 3000 }
      );
    });

    it('should navigate to sessions page after successful deletion', () => {
      // Call the method
      component.delete();

      // Verify navigation to sessions page
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  /**
   * Tests for the participate() method
   */
  describe('participate', () => {
    it('should call sessionApiService.participate with correct IDs', () => {
      // Call the method
      component.participate();

      // Verify sessionApiService.participate was called with correct IDs
      expect(sessionApiServiceMock.participate).toHaveBeenCalledWith(
        mockSessionId,
        mockUserId
      );
    });

    it('should refresh session data after participating', () => {
      // Reset mock to track new calls
      sessionApiServiceMock.detail.mockClear();

      // Call the method
      component.participate();

      // Verify session detail was fetched again
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith(mockSessionId);
    });
  });

  /**
   * Tests for the unParticipate() method
   */
  describe('unParticipate', () => {
    it('should call sessionApiService.unParticipate with correct IDs', () => {
      // Call the method
      component.unParticipate();

      // Verify sessionApiService.unParticipate was called with correct IDs
      expect(sessionApiServiceMock.unParticipate).toHaveBeenCalledWith(
        mockSessionId,
        mockUserId
      );
    });

    it('should refresh session data after unparticipating', () => {
      // Reset mock to track new calls
      sessionApiServiceMock.detail.mockClear();

      // Call the method
      component.unParticipate();

      // Verify session detail was fetched again
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith(mockSessionId);
    });
  });

  /**
   * Tests for conditional display of UI elements based on user role and participation
   * These tests check the component's property values that would drive UI visibility
   */
  describe('UI visibility conditions', () => {
    it('should show admin features when user is admin', () => {
      // Current test user is admin
      expect(component.isAdmin).toBe(true);

      // Test with a non-admin user
      const nonAdminSession = {
        ...mockSessionInfo,
        admin: false
      };
      sessionServiceMock.sessionInformation = nonAdminSession;

      // Create a new component to pick up the changes
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isAdmin).toBe(false);
    });

    it('should correctly track user participation status', () => {
      // Current test case has user participating
      expect(component.isParticipate).toBe(true);

      // Test with a session where user is not participating
      const nonParticipatingSession = {
        ...mockSession,
        users: [4, 5] // User 2 not in list
      };
      sessionApiServiceMock.detail.mockReturnValue(of(nonParticipatingSession));

      // Re-fetch session
      component.ngOnInit();

      expect(component.isParticipate).toBe(false);
    });
  });
});

