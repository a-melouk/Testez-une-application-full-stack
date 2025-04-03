import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Session } from '../interfaces/session.interface';

import { SessionApiService } from './session-api.service';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  // Mock data for testing
  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2023-01-01T10:00:00'),
    teacher_id: 2,
    users: [3, 4, 5],
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2022-12-05')
  };

  const mockSessions: Session[] = [
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

  // Session without id for create tests
  const newSession: Session = {
    name: 'New Yoga Session',
    description: 'A new yoga session',
    date: new Date('2023-01-10T10:00:00'),
    teacher_id: 2,
    users: []
  };

  beforeEach(() => {
    // Configure testing module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });

    // Inject service and HTTP controller
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    // Verify service is created
    expect(service).toBeTruthy();
  });

  /**
   * Test for the all() method
   * This method gets all sessions
   */
  describe('all', () => {
    it('should retrieve all sessions', () => {
      // Call the method
      service.all().subscribe(sessions => {
        // Verify response matches mock data
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
      });

      // Expect one GET request to the correct URL
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockSessions);
    });
  });

  /**
   * Test for the detail() method
   * This method gets details for a specific session
   */
  describe('detail', () => {
    it('should retrieve a specific session by id', () => {
      const sessionId = '1';

      // Call the method
      service.detail(sessionId).subscribe(session => {
        // Verify response matches mock data
        expect(session).toEqual(mockSession);
      });

      // Expect one GET request to the correct URL
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockSession);
    });
  });

  /**
   * Test for the delete() method
   * This method deletes a session by id
   */
  describe('delete', () => {
    it('should delete a session by id', () => {
      const sessionId = '1';

      // Call the method
      service.delete(sessionId).subscribe(response => {
        // Delete usually returns an empty response
        expect(response).toBeTruthy();
      });

      // Expect one DELETE request to the correct URL
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');

      // Respond with success
      req.flush({ success: true });
    });
  });

  /**
   * Test for the create() method
   * This method creates a new session
   */
  describe('create', () => {
    it('should create a new session', () => {
      // A copy of newSession with an id added (simulating server response)
      const createdSession = { ...newSession, id: 3 };

      // Call the method
      service.create(newSession).subscribe(session => {
        // Verify response includes the new id
        expect(session).toEqual(createdSession);
        expect(session.id).toBe(3);
      });

      // Expect one POST request to the correct URL
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');

      // Verify request body contains the session data
      expect(req.request.body).toEqual(newSession);

      // Respond with the created session
      req.flush(createdSession);
    });
  });

  /**
   * Test for the update() method
   * This method updates an existing session
   */
  describe('update', () => {
    it('should update an existing session', () => {
      const sessionId = '1';
      const updatedSession = {
        ...mockSession,
        name: 'Updated Session',
        description: 'Updated description'
      };

      // Call the method
      service.update(sessionId, updatedSession).subscribe(session => {
        // Verify response contains updated data
        expect(session).toEqual(updatedSession);
        expect(session.name).toBe('Updated Session');
      });

      // Expect one PUT request to the correct URL
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');

      // Verify request body contains the updated session data
      expect(req.request.body).toEqual(updatedSession);

      // Respond with the updated session
      req.flush(updatedSession);
    });
  });

  /**
   * Test for the participate() method
   * This method adds a user to a session's participants
   */
  describe('participate', () => {
    it('should add a user to session participants', () => {
      const sessionId = '1';
      const userId = '3';

      // Call the method
      service.participate(sessionId, userId).subscribe(response => {
        // Response should be void (undefined)
        expect(response).toBeUndefined();
      });

      // Expect one POST request to the correct URL
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('POST');

      // Body should be null as specified in the service
      expect(req.request.body).toBeNull();

      // Respond with empty data (void)
      req.flush(null);
    });
  });

  /**
   * Test for the unParticipate() method
   * This method removes a user from a session's participants
   */
  describe('unParticipate', () => {
    it('should remove a user from session participants', () => {
      const sessionId = '1';
      const userId = '3';

      // Call the method
      service.unParticipate(sessionId, userId).subscribe(response => {
        // Response should be void (undefined)
        expect(response).toBeUndefined();
      });

      // Expect one DELETE request to the correct URL
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('DELETE');

      // Respond with empty data (void)
      req.flush(null);
    });
  });
});
