import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('keycloak-js', () => ({
  default: vi.fn(function(config) {
    return { ...config };
  }),
}));

beforeEach(() => {
  vi.resetModules();
  delete import.meta.env.VITE_KEYCLOAK_URL;
});

it('uses VITE_KEYCLOAK_URL when set', async () => {
  import.meta.env.VITE_KEYCLOAK_URL = 'http://keycloak:8080';
  await import('../keycloak');
  const keycloakJs = await import('keycloak-js');
  expect(keycloakJs.default).toHaveBeenCalledWith({
    clientId: 'peopleportal-frontend',
    realm: 'peopleportal',
    url: 'http://keycloak:8080',
  });
});

it('falls back to default URL when VITE_KEYCLOAK_URL is not set', async () => {
  await import('../keycloak');
  const keycloakJs = await import('keycloak-js');
  expect(keycloakJs.default).toHaveBeenCalledWith({
    clientId: 'peopleportal-frontend',
    realm: 'peopleportal',
    url: 'http://localhost:8080',
  });
});

it('has correct realm and clientId', async () => {
  await import('../keycloak');
  const keycloakJs = await import('keycloak-js');
  const config = keycloakJs.default.mock.calls[0][0];
  expect(config.realm).toBe('peopleportal');
  expect(config.clientId).toBe('peopleportal-frontend');
});
