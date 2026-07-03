import { CssBaseline, ThemeProvider } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
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
import Vouchers from './pages/Vouchers/Vouchers';

const eventLogger = (event, error) => {
  if (event === 'onAuthSuccess') {
    sessionStorage.setItem('keycloak-token', keycloak.token);
  }
};

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} initOptions={{ onLoad: 'login-required', pkceMethod: 'S256' }}>
      <CustomThemeProvider>
        <CssBaseline />
        <BrowserRouter>
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
                <Route path="/vouchers" element={<Vouchers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/access-denied" element={<AccessDenied />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </BrowserRouter>
      </CustomThemeProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
