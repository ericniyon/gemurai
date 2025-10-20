import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { saveApplicationProgress, markApplicationAsSubmitted } from '@/lib/application-storage'

// Mock fetch
global.fetch = jest.fn()

describe('Application Submission', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'Gemurai_token=test-token',
    });
  });

  it('should successfully submit an application', async () => {
    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          application: {
            id: 'test-id',
            phone: '1234567890',
            email: 'test@example.com',
            status: 'temporary',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            formData: { 
              q1: 'Test Name',
              q7: 'test@example.com',
              q8: '1234567890'
            },
            currentStep: 1
          }
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          application: {
            id: 'test-id',
            status: 'submitted'
          }
        })
      }));

    // Test application submission
    const applicationId = 'test-id';
    await expect(markApplicationAsSubmitted(applicationId)).resolves.not.toThrow();

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/applications/test-id',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  it('should handle missing authentication token', async () => {
    // Clear cookie
    document.cookie = '';

    await expect(markApplicationAsSubmitted('test-id'))
      .rejects
      .toThrow('Authentication required: Please log in to continue');
  });

  it('should handle application not found', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        message: 'Application not found'
      })
    }));

    await expect(markApplicationAsSubmitted('non-existent-id'))
      .rejects
      .toThrow('Application not found or access denied');
  });

  it('should handle server errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({
        message: 'Server error occurred'
      })
    }));

    await expect(markApplicationAsSubmitted('test-id'))
      .rejects
      .toThrow('Server error occurred');
  });
}); 