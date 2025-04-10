import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { testRequiredFormField } from '../../../../testing/test-helpers';
import { Observable } from 'rxjs';
import { MatSnackBarRef, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NavigationExtras } from '@angular/router';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiServiceMock: { detail: jest.Mock, create: jest.Mock, update: jest.Mock };
  let sessionServiceMock: { sessionInformation: SessionInformation };
  let teacherServiceMock: { all: jest.Mock };
  let matSnackBarMock: { open: jest.Mock };
  let routerMock: { navigate: jest.Mock, url: string };
  let activatedRouteMock: { snapshot: { paramMap: { get: jest.Mock } } };
  let formBuilder: FormBuilder;

  // Mock data for testing
  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2023-01-01T10:00:00'),
    teacher_id: 1,
    users: [2, 3, 4],
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2022-12-05')
  };

  const mockSessionInfo: SessionInformation = {
    id: 1,
    token: 'fake-jwt-token',
    type: 'Bearer',
    username: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true // Admin user
  };

  // Setup for create mode
  function setupCreateMode(): void {
    routerMock.url = '/sessions/create';
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // Setup for update mode
  function setupUpdateMode(): void {
    routerMock.url = '/sessions/update/1';
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
    sessionApiServiceMock.detail.mockReturnValue(of(mockSession));
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    // Create mock objects for all dependencies
    sessionApiServiceMock = {
      detail: jest.fn<Observable<Session>, [string]>().mockReturnValue(of(mockSession)),
      create: jest.fn<Observable<Session>, [Session]>().mockReturnValue(of(mockSession)),
      update: jest.fn<Observable<Session>, [string, Session]>().mockReturnValue(of(mockSession))
    };

    teacherServiceMock = {
      all: jest.fn<Observable<Teacher[]>, []>().mockReturnValue(of(mockTeachers))
    };

    sessionServiceMock = {
      sessionInformation: mockSessionInfo
    };

    matSnackBarMock = { open: jest.fn<MatSnackBarRef<any>, [string, string?, MatSnackBarConfig?]>() };

    routerMock = {
      navigate: jest.fn<Promise<boolean>, [any[], NavigationExtras?]>(),
      url: '/sessions/create' // Default to create mode
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn<string | null, [string]>().mockReturnValue(null) // Default to no ID (create mode)
        }
      }
    };

    // Configure testing module
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      providers: [
        FormBuilder,
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MatSnackBar, useValue: matSnackBarMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    // Get FormBuilder instance
    formBuilder = TestBed.inject(FormBuilder);

    // Default to create mode
    setupCreateMode();
  });

  it('should create', () => {
    // Verify component is created
    expect(component).toBeTruthy();
  });

  /**
   * Tests for component initialization
   */
  describe('initialization', () => {
    it('should redirect non-admin users to sessions page', () => {
      // Set user as non-admin
      const nonAdminSession = { ...mockSessionInfo, admin: false };
      sessionServiceMock.sessionInformation = nonAdminSession;

      // Re-create component
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Verify redirect
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should initialize form in create mode', () => {
      // Already in create mode from setupCreateMode()

      // Verify form creation
      expect(component.sessionForm).toBeTruthy();
      expect(component.onUpdate).toBe(false);

      // Verify form fields are empty
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe('');
    });

    it('should initialize form in update mode with session data', () => {
      // Switch to update mode
      setupUpdateMode();

      // Verify session data is fetched
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');

      // Verify form creation with session data
      expect(component.sessionForm).toBeTruthy();
      expect(component.onUpdate).toBe(true);

      // Verify form fields contain session data
      expect(component.sessionForm?.get('name')?.value).toBe(mockSession.name);
      expect(component.sessionForm?.get('description')?.value).toBe(mockSession.description);
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(mockSession.teacher_id);
    });

    it('should load teachers list', () => {
      // Verify teachers service is called
      expect(teacherServiceMock.all).toHaveBeenCalled();

      // teachers$ is directly from the service
      expect(component.teachers$).toBeTruthy();
    });
  });

  /**
   * Tests for form validation
   */
  describe('form validation', () => {
    it('should validate required fields', () => {
      // Form should be invalid when empty
      expect(component.sessionForm?.valid).toBeFalsy();

      // Set required values
      component.sessionForm?.patchValue({
        name: 'Test Session',
        date: '2023-01-01',
        teacher_id: 1,
        description: 'Test description'
      });

      // Form should be valid when all required fields are filled
      expect(component.sessionForm?.valid).toBeTruthy();
    });

    it('should validate name field is required', () => {
      // Using our helper function for testing required fields
      testRequiredFormField(component.sessionForm!, 'name', 'Test Session');
    });

    it('should validate description field is required', () => {
      // Using our helper function for testing required fields
      testRequiredFormField(component.sessionForm!, 'description', 'Test description');
    });
  });

  /**
   * Tests for submit method - create mode
   */
  describe('submit - create mode', () => {
    beforeEach(() => {
      // Ensure we're in create mode
      setupCreateMode();

      // Set up a valid form
      component.sessionForm?.patchValue({
        name: 'New Session',
        date: '2023-01-01',
        teacher_id: 1,
        description: 'New session description'
      });
    });

    it('should call sessionApiService.create with form data', () => {
      // Call the method
      component.submit();

      // Verify service is called with form data
      expect(sessionApiServiceMock.create).toHaveBeenCalled();

      // Get the actual call argument
      const callArg = sessionApiServiceMock.create.mock.calls[0][0];

      // Verify form data
      expect(callArg.name).toBe('New Session');
      expect(callArg.description).toBe('New session description');
      expect(callArg.teacher_id).toBe(1);
    });

    it('should show success message after creation', () => {
      // Call the method
      component.submit();

      // Verify snackbar is shown
      expect(matSnackBarMock.open).toHaveBeenCalledWith(
        'Session created !',
        'Close',
        { duration: 3000 }
      );
    });

    it('should navigate to sessions page after creation', () => {
      // Call the method
      component.submit();

      // Verify navigation
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  /**
   * Tests for submit method - update mode
   */
  describe('submit - update mode', () => {
    beforeEach(() => {
      // Switch to update mode
      setupUpdateMode();

      // Modify the form
      component.sessionForm?.patchValue({
        name: 'Updated Session',
        date: '2023-02-01',
        teacher_id: 2,
        description: 'Updated description'
      });
    });

    it('should call sessionApiService.update with form data', () => {
      // Call the method
      component.submit();

      // Verify service is called with correct ID and form data
      expect(sessionApiServiceMock.update).toHaveBeenCalledWith('1', expect.any(Object));

      // Get the actual call argument
      const callArg = sessionApiServiceMock.update.mock.calls[0][1];

      // Verify form data
      expect(callArg.name).toBe('Updated Session');
      expect(callArg.description).toBe('Updated description');
      expect(callArg.teacher_id).toBe(2);
    });

    it('should show success message after update', () => {
      // Call the method
      component.submit();

      // Verify snackbar is shown
      expect(matSnackBarMock.open).toHaveBeenCalledWith(
        'Session updated !',
        'Close',
        { duration: 3000 }
      );
    });

    it('should navigate to sessions page after update', () => {
      // Call the method
      component.submit();

      // Verify navigation
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });
});
