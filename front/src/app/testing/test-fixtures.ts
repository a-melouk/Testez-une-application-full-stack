import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { User } from '../interfaces/user.interface';
import { Session } from '../features/sessions/interfaces/session.interface';
import { Teacher } from '../interfaces/teacher.interface';

/**
 * Common mock user for testing
 */
export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: '',
  admin: false,
  createdAt: new Date('2022-01-01')
};

/**
 * Common mock session information for testing
 */
export const mockSessionInfo: SessionInformation = {
  id: 1,
  token: 'fake-jwt-token',
  type: 'Bearer',
  username: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  admin: false
};

/**
 * Admin version of session information
 */
export const mockAdminSessionInfo: SessionInformation = {
  ...mockSessionInfo,
  admin: true
};

/**
 * Common mock session for testing
 */
export const mockSession: Session = {
  id: 1,
  name: 'Yoga Session',
  description: 'A relaxing yoga session',
  date: new Date('2023-01-01T10:00:00'),
  teacher_id: 2,
  users: [3, 4, 5],
  createdAt: new Date('2022-12-01'),
  updatedAt: new Date('2022-12-05')
};

/**
 * Collection of mock sessions for testing
 */
export const mockSessions: Session[] = [
  { ...mockSession },
  {
    id: 2,
    name: 'Meditation Session',
    description: 'Meditation for beginners',
    date: new Date('2023-01-02T11:00:00'),
    teacher_id: 2,
    users: [3, 6],
    createdAt: new Date('2022-12-02'),
    updatedAt: new Date('2022-12-06')
  }
];

/**
 * Common mock teacher for testing
 */
export const mockTeacher: Teacher = {
  id: 3,
  lastName: 'Smith',
  firstName: 'John',
  createdAt: new Date('2022-11-01'),
  updatedAt: new Date('2022-11-05')
};

/**
 * Collection of mock teachers for testing
 */
export const mockTeachers: Teacher[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
];
