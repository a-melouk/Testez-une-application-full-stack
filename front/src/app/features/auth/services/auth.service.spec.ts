import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock data for testing
  const mockRegisterRequest: RegisterRequest = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
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

  beforeEach(() => {
    // Configure the testing module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    // Inject the service and HTTP testing controller
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    // Verify that the service is created
    expect(service).toBeTruthy();
  });

  /**
   * Test for the register method
   * This method sends a POST request to register a new user
   */
  describe('register', () => {
    it('should send a POST request to register a user', () => {
      // Call the method with mock data
      service.register(mockRegisterRequest).subscribe(response => {
        // Response should be void (undefined)
        expect(response).toBeUndefined();
      });

      // Expect one request to the correct URL with the correct method
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');

      // Verify the request body contains the registration data
      expect(req.request.body).toEqual(mockRegisterRequest);

      // Respond with empty data (void)
      req.flush(null);
    });

    it('should handle registration errors', () => {
      // Set up the error response
      const errorResponse = { status: 400, statusText: 'Bad Request' };
      const errorMessage = 'Email already exists';

      // Call the method
      let actualError: any;
      service.register(mockRegisterRequest).subscribe(
        () => fail('Expected an error, not success'),
        error => {
          actualError = error;
        }
      );

      // Simulate an error response
      const req = httpMock.expectOne('api/auth/register');
      req.flush(errorMessage, errorResponse);

      // Verify the error was caught
      expect(actualError).toBeTruthy();
      expect(actualError.status).toBe(400);
    });
  });

  /**
   * Test for the login method
   * This method sends a POST request to authenticate a user
   */
  describe('login', () => {
    it('should send a POST request with login credentials', () => {
      // Call the method with mock data
      service.login(mockLoginRequest).subscribe(response => {
        // Verify the response contains the session information
        expect(response).toEqual(mockSessionInfo);
      });

      // Expect one request to the correct URL with the correct method
      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');

      // Verify the request body contains the login credentials
      expect(req.request.body).toEqual(mockLoginRequest);

      // Respond with mock session information
      req.flush(mockSessionInfo);
    });

    it('should handle login errors', () => {
      // Set up the error response
      const errorResponse = { status: 401, statusText: 'Unauthorized' };
      const errorMessage = 'Invalid credentials';

      // Call the method
      let actualError: any;
      service.login(mockLoginRequest).subscribe(
        () => fail('Expected an error, not success'),
        error => {
          actualError = error;
        }
      );

      // Simulate an error response
      const req = httpMock.expectOne('api/auth/login');
      req.flush(errorMessage, errorResponse);

      // Verify the error was caught
      expect(actualError).toBeTruthy();
      expect(actualError.status).toBe(401);
    });
  });
});