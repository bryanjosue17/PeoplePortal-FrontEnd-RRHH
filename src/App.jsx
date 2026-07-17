import { CssBaseline } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
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
import Profile from './pages/Profile/Profile';

/**
 * Muestra el LoginPage si el usuario no está autenticado,
 * o las rutas protegidas si sí lo está.
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Mientras se restaura la sesión desde sessionStorage, no renderizar nada
  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <CustomThemeProvider>
        <CssBaseline />
        <LoginPage />
      </CustomThemeProvider>
    );
  }

  return (
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
              <Route path="/nomina" element={<Nomina />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/access-denied" element={<AccessDenied />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
