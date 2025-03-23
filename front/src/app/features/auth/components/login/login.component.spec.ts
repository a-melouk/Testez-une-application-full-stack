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
  });
});
