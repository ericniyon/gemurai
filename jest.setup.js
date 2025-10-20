// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock window.fetch
global.fetch = jest.fn();

// Setup document.cookie for tests
Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: '',
});

// Suppress console.error during tests
console.error = jest.fn(); 