import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../interfaces/registerRequest.interface';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: { register: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    // Create mock objects with Jest
    authServiceMock = { register: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    const mockRegisterRequest: RegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    beforeEach(() => {
      // Set up the form with test values
      component.form.setValue(mockRegisterRequest);
      // Reset mocks
      jest.clearAllMocks();
    });

    it('should call authService.register with form values', () => {
      // Setup the mock to return an observable of void
      authServiceMock.register.mockReturnValue(of(void 0));

      // Call the method under test
      component.submit();

      // Assert that the mock was called with the correct arguments
      expect(authServiceMock.register).toHaveBeenCalledWith(mockRegisterRequest);
    });

    it('should navigate to /login on successful registration', () => {
      // Setup the mock to return an observable of void
      authServiceMock.register.mockReturnValue(of(void 0));

      // Call the method under test
      component.submit();

      // Assert that the router was called with the correct arguments
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set onError to true when registration fails', () => {
      // Setup the mock to return an error
      authServiceMock.register.mockReturnValue(
        throwError(() => new Error('Registration failed'))
      );

      // Ensure onError is initially false
      component.onError = false;

      // Call the method under test
      component.submit();

      // Assert that onError is now true
      expect(component.onError).toBe(true);
    });
  });
});
