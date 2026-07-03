import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Layout from '../components/Layout';

vi.mock('@react-keycloak/web', () => ({
  useKeycloak: () => ({
    keycloak: {
      logout: vi.fn(),
      tokenParsed: {
        email: 'admin@test.com',
        name: 'Admin User',
        preferred_username: 'admin',
      },
    },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderWithRouter(component) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      {component}
    </MemoryRouter>
  );
}

it('renders app title in drawer', () => {
  renderWithRouter(<Layout><div>Content</div></Layout>);
  const titles = screen.getAllByText('PeoplePortal');
  expect(titles.length).toBeGreaterThanOrEqual(1);
});

it('renders subtitle (appears in temporary and permanent drawer)', () => {
  renderWithRouter(<Layout><div>Content</div></Layout>);
  const subtitles = screen.getAllByText('RRHH');
  expect(subtitles.length).toBeGreaterThanOrEqual(1);
});

it('renders all navigation items for RRHH', () => {
  renderWithRouter(<Layout><div>Content</div></Layout>);
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Empleados').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Documentos').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Solicitudes').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Comunicados').length).toBeGreaterThanOrEqual(1);
});

it('renders user name from token', () => {
  renderWithRouter(<Layout><div>Content</div></Layout>);
  expect(screen.getByText('Admin User')).toBeInTheDocument();
});

it('renders children content', () => {
  renderWithRouter(<Layout><div>RRHH Content</div></Layout>);
  expect(screen.getByText('RRHH Content')).toBeInTheDocument();
});

it('highlights active route in drawer', () => {
  renderWithRouter(<Layout><div>Content</div></Layout>);
  const dashboardButtons = screen.getAllByRole('button');
  const hasSelected = dashboardButtons.some(btn => btn.classList.contains('Mui-selected'));
  expect(hasSelected).toBe(true);
});
