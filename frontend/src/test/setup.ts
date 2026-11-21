import '@testing-library/jest-dom/vitest';

// Limpieza entre tests (RTL ya desmonta; esto garantiza estado limpio
// de Storage/Mocks que los specs del service layer y el AuthContext usan).
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
