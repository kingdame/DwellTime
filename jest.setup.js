// Jest setup file - minimal config for unit tests

// Silence console during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};
