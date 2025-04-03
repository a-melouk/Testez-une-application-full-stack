import { of } from 'rxjs';
import { mockSessionInfo, mockUser } from './test-fixtures';
import { FormGroup } from '@angular/forms';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { expect } from '@jest/globals';

/**
 * Creates a mock UserService
 * @param user The mock user to return from getById
 * @returns A mock UserService
 */
export function createMockUserService(user = mockUser) {
  return {
    getById: jest.fn().mockReturnValue(of(user)),
    delete: jest.fn().mockReturnValue(of({}))
  };
}

/**
 * Creates a mock SessionService
 * @param isAdmin Whether the user should be an admin
 * @returns A mock SessionService
 */
export function createMockSessionService(isAdmin = false) {
  const sessionInfo: SessionInformation = {
    ...mockSessionInfo,
    admin: isAdmin
  };

  return {
    sessionInformation: sessionInfo,
    isLogged: true,
    logOut: jest.fn(),
    $isLogged: jest.fn().mockReturnValue(of(true))
  };
}

/**
 * Creates a mock Router
 * @returns A mock Router
 */
export function createMockRouter() {
  return {
    navigate: jest.fn(),
    url: '/sessions/create'
  };
}

/**
 * Creates a mock MatSnackBar
 * @returns A mock MatSnackBar
 */
export function createMockSnackBar() {
  return {
    open: jest.fn()
  };
}

/**
 * Tests a required form field
 * @param form The form to test
 * @param fieldName The name of the field to test
 * @param validValue A valid value for the field
 */
export function testRequiredFormField(form: FormGroup, fieldName: string, validValue: any) {
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
