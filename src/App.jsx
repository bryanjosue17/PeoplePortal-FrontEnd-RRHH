import { CssBaseline } from '@mui/material';
import { useKeycloak, ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { CustomThemeProvider } from './context/ThemeContext';
import keycloak from './keycloak';
import AccessDenied from './pages/AccessDenied/AccessDenied';
import Announcements from './pages/Announcements/Announcements';
import Benefits from './pages/Benefits/Benefits';
import Dashboard from './pages/Dashboard/Dashboard';
import Documents from './pages/Documents/Documents';
import EmployeeDetail from './pages/EmployeeDetail/EmployeeDetail';
import Employees from './pages/Employees/Employees';
import Reports from './pages/Reports/Reports';
import Requests from './pages/Requests/Requests';
import Nomina from './pages/Nomina/Nomina';
import UserManagement from './pages/UserManagement/UserManagement';

const eventLogger = (event, _error) => {
  if (event === 'onAuthSuccess' || event === 'onTokenRefreshed' || event === 'onAuthRefreshSuccess') {
    if (keycloak.token) {
      sessionStorage.setItem('keycloak-token', keycloak.token);
    }
  }
  if (event === 'onAuthLogout' || event === 'onAuthRefreshError') {
    sessionStorage.removeItem('keycloak-token');
  }
};

// Bloquea el render de rutas hasta que keycloak.authenticated === true
function AuthGuard({ children }) {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized || !keycloak.authenticated) return null;
  return children;
}

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} initOptions={{ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false }}>
      <CustomThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <AuthGuard>
            <ProtectedRoute>
              <Layout>
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/nomina" element={<Nomina />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/access-denied" element={<AccessDenied />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
          </AuthGuard>
        </BrowserRouter>
      </CustomThemeProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
