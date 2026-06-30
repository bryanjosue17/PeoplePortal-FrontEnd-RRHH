import { CssBaseline, ThemeProvider } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import keycloak from './keycloak';
import theme from './theme/theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/Employees/Employees';
import EmployeeDetail from './pages/EmployeeDetail/EmployeeDetail';
import Documents from './pages/Documents/Documents';
import Requests from './pages/Requests/Requests';
import Announcements from './pages/Announcements/Announcements';
import Benefits from './pages/Benefits/Benefits';
import Reports from './pages/Reports/Reports';

const eventLogger = (event) => {
  if (event === 'onAuthSuccess') {
    sessionStorage.setItem('keycloak-token', keycloak.token);
  }
};

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} initOptions={{ onLoad: 'login-required', pkceMethod: 'S256' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
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
          <Route path="/reports" element={<Reports />} />
        </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
