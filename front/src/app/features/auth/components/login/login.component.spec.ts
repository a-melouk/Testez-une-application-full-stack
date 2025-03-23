import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { LoginRequest } from '../../interfaces/loginRequest.interface';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: jest.Mock };
  let sessionServiceMock: { logIn: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    // Create mock objects with Jest
    authServiceMock = { login: jest.fn() };
    sessionServiceMock = { logIn: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    const mockLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockSessionInfo: SessionInformation = {
      id: 1,
      token: 'fake-jwt-token',
      type: 'Bearer',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    beforeEach(() => {
      // Set up the form with test values
      component.form.setValue(mockLoginRequest);
      // Reset mocks
      jest.clearAllMocks();
    });

    it('should call authService.login with form values', () => {
      // Setup the mock to return an observable of SessionInformation
      authServiceMock.login.mockReturnValue(of(mockSessionInfo));

      // Call the method under test
      component.submit();

      // Verify authService.login was called with the correct parameters
      expect(authServiceMock.login).toHaveBeenCalledWith(mockLoginRequest);
    });

    it('should call sessionService.logIn and navigate to sessions on successful login', () => {
      // Setup the mock to return an observable of SessionInformation
      authServiceMock.login.mockReturnValue(of(mockSessionInfo));

      // Call the method under test
      component.submit();

      // Verify sessionService.logIn was called with the response
      expect(sessionServiceMock.logIn).toHaveBeenCalledWith(mockSessionInfo);

      // Verify navigation occurred to the expected route
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should set onError to true when login fails', () => {
      // Setup the mock to return an error
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Login failed'))
      );

      // Ensure onError is initially false
      component.onError = false;

      // Call the method under test
      component.submit();

      // Verify onError was set to true
      expect(component.onError).toBe(true);

      // Verify navigation was not called
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should not attempt to navigate when login fails', () => {
      // Setup the mock to return an error
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Login failed'))
      );

      // Call the method under test
      component.submit();

      // Verify sessionService.logIn was not called
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();

      // Verify navigation was not called
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should handle authentication failure with wrong credentials', () => {
      // Create a specific error response similar to what the API would return
      const authError = {
        status: 401,
        error: { message: 'Invalid credentials' }
      };

      // Setup the mock to return an auth failure error
      authServiceMock.login.mockReturnValue(
        throwError(() => authError)
      );

      // Call the method under test
      component.submit();

      // Verify onError was set to true
      expect(component.onError).toBe(true);

      // Verify auth service was called
      expect(authServiceMock.login).toHaveBeenCalled();

      // Verify session service was not updated
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();

      // Verify no navigation occurred
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should not submit when a mandatory field is missing', () => {
      // Create an incomplete form with missing password
      const incompleteData = {
        email: 'test@example.com',
        password: '' // Missing password
      };

      // Set the form with incomplete data
      component.form.setValue(incompleteData);

      // Manually mark form as touched to trigger validations
      component.form.get('password')?.markAsTouched();

      // Form should be invalid
      expect(component.form.valid).toBe(false);

      // Get the submit button - it should be disabled
      let submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();

      // Run the same test with missing email
      component.form.setValue({
        email: '', // Missing email
        password: 'password123'
      });

      component.form.get('email')?.markAsTouched();
      fixture.detectChanges();

      // Form should still be invalid
      expect(component.form.valid).toBe(false);

      // Submit button should still be disabled
      submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should validate email format correctly', () => {
      // Set invalid email format
      component.form.setValue({
        email: 'invalid-email',
        password: 'password123'
      });

      // Mark field as touched to trigger validation
      component.form.get('email')?.markAsTouched();

      // Detect changes to update the UI
      fixture.detectChanges();

      // Check if the email field has errors
      const emailErrors = component.form.get('email')?.errors;
      expect(emailErrors).toBeTruthy();
      expect(emailErrors?.['email']).toBeTruthy();

      // Verify form is invalid
      expect(component.form.valid).toBe(false);

      // Submit method should not call auth service with invalid form
      component.submit();
      expect(authServiceMock.login).not.toHaveBeenCalled();

      // Now test with valid email
      component.form.setValue({
        email: 'valid@example.com',
        password: 'password123'
      });

      // Check that email field no longer has errors
      expect(component.form.get('email')?.errors).toBeFalsy();
    });

    it('should disable the submit button when form is invalid', () => {
      // Set invalid form data
      component.form.setValue({
        email: 'invalid-email',
        password: 'pwd'
      });

      // Mark fields as touched to trigger validation
      component.form.get('email')?.markAsTouched();
      component.form.get('password')?.markAsTouched();

      fixture.detectChanges();

      // Get the submit button
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      // Check if button is disabled
      expect(submitButton.disabled).toBeTruthy();

      // Fix the form data
      component.form.setValue({
        email: 'valid@example.com',
        password: 'password123'
      });

      fixture.detectChanges();

      // Button should now be enabled
      expect(submitButton.disabled).toBeFalsy();
    });

    it('should show error message when login fails', () => {
      // Initially error message should not be displayed
      let errorMessage = fixture.nativeElement.querySelector('.error');
      expect(errorMessage).toBeFalsy();

      // Setup the mock to return an error
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Login failed'))
      );

      // Call the method under test
      component.submit();

      // Update the view
      fixture.detectChanges();

      // Error message should now be displayed
      errorMessage = fixture.nativeElement.querySelector('.error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('An error occurred');
    });
  });
});
