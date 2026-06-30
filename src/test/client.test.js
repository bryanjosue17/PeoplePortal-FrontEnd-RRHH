import { describe, it, expect, vi, beforeEach } from 'vitest';

let interceptorFn;

vi.mock('axios', () => {
  interceptorFn = null;
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: vi.fn((fn) => {
          interceptorFn = fn;
        }),
      },
    },
    defaults: {},
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

async function getInterceptor() {
  await import('../api/client');
  return interceptorFn;
}

beforeEach(async () => {
  vi.resetModules();
  interceptorFn = null;
  sessionStorage.clear();
  delete import.meta.env.VITE_API_URL;
});

it('uses VITE_API_URL as baseURL when set', async () => {
  import.meta.env.VITE_API_URL = 'http://api:8080';
  const axios = (await import('axios')).default;
  await import('../api/client');
  expect(axios.create).toHaveBeenCalledWith(
    expect.objectContaining({ baseURL: 'http://api:8080' })
  );
});

it('uses empty string as baseURL when VITE_API_URL is not set', async () => {
  const axios = (await import('axios')).default;
  await import('../api/client');
  expect(axios.create).toHaveBeenCalledWith(
    expect.objectContaining({ baseURL: '' })
  );
});

it('sets Content-Type header to application/json', async () => {
  const axios = (await import('axios')).default;
  await import('../api/client');
  expect(axios.create).toHaveBeenCalledWith(
    expect.objectContaining({
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

it('adds Authorization header when token exists in sessionStorage', async () => {
  sessionStorage.setItem('keycloak-token', 'test-token-123');
  const fn = await getInterceptor();
  const config = { headers: {} };
  const result = fn(config);
  expect(result.headers.Authorization).toBe('Bearer test-token-123');
});

it('does not add Authorization header when no token in sessionStorage', async () => {
  const fn = await getInterceptor();
  const config = { headers: {} };
  const result = fn(config);
  expect(result.headers.Authorization).toBeUndefined();
});
