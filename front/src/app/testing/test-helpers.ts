import { of, Observable } from 'rxjs';
import { mockSessionInfo, mockUser } from './test-fixtures';
import { FormGroup } from '@angular/forms';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { expect } from '@jest/globals';
import { User } from '../interfaces/user.interface';
import { MatSnackBarRef, MatSnackBarConfig } from '@angular/material/snack-bar';

interface MockUserService {
  getById: jest.Mock<Observable<User>, [string]>;
  delete: jest.Mock<Observable<any>, [string]>;
}

interface MockSessionService {
  sessionInformation: SessionInformation;
  isLogged: boolean;
  logOut: jest.Mock<void, []>;
  $isLogged: jest.Mock<Observable<boolean>, []>;
}

interface MockRouter {
  navigate: jest.Mock<Promise<boolean>, [any[], object?]>;
  url: string;
}

interface MockSnackBar {
  open: jest.Mock<MatSnackBarRef<any>, [string, string?, MatSnackBarConfig?]>;
}

/**
 * Creates a mock UserService
 * @param user The mock user to return from getById
 * @returns A mock UserService
 */
export function createMockUserService(user = mockUser): MockUserService {
  return {
    getById: jest.fn<Observable<User>, [string]>().mockReturnValue(of(user)),
    delete: jest.fn<Observable<any>, [string]>().mockReturnValue(of({}))
  };
}

/**
 * Creates a mock SessionService
 * @param isAdmin Whether the user should be an admin
 * @returns A mock SessionService
 */
export function createMockSessionService(isAdmin = false): MockSessionService {
  const sessionInfo: SessionInformation = {
    ...mockSessionInfo,
    admin: isAdmin
  };

  return {
    sessionInformation: sessionInfo,
    isLogged: true,
    logOut: jest.fn<void, []>(),
    $isLogged: jest.fn<Observable<boolean>, []>().mockReturnValue(of(true))
  };
}

/**
 * Creates a mock Router
 * @returns A mock Router
 */
export function createMockRouter(): MockRouter {
  return {
    navigate: jest.fn<Promise<boolean>, [any[], object?]>(),
    url: '/sessions/create'
  };
}

/**
 * Creates a mock MatSnackBar
 * @returns A mock MatSnackBar
 */
export function createMockSnackBar(): MockSnackBar {
  return {
    open: jest.fn<MatSnackBarRef<any>, [string, string?, MatSnackBarConfig?]>()
  };
}

/**
 * Tests a required form field
 * @param form The form to test
 * @param fieldName The name of the field to test
 * @param validValue A valid value for the field
 */
export function testRequiredFormField(form: FormGroup, fieldName: string, validValue: any): void {
  // Get the form control
  const field = form.get(fieldName);

  // Verify initially invalid with required error
  expect(field?.valid).toBeFalsy();
  expect(field?.errors?.['required']).toBeTruthy();

  // Set valid value
  field?.setValue(validValue);

  // Verify now valid
  expect(field?.valid).toBeTruthy();
  expect(field?.errors).toBeNull();
}
