import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Different port for testing
process.env.MOCK_API_EMAIL = 'test@example.com';
process.env.MOCK_API_PASSWORD = 'testpass123';

// Suppress console.log during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};