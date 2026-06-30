import { useKeycloak } from '@react-keycloak/web';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const ALLOWED_ROLES = ['hr', 'admin'];

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!keycloak?.authenticated) return null;

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const hasAccess = roles.some(r => ALLOWED_ROLES.includes(r));

  if (!hasAccess) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 480 }}>
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={700}>
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Este portal es exclusivo para personal de RRHH y Administradores.
            Tu usuario no tiene los permisos necesarios.
          </Typography>
          <Button
            variant="contained"
            href="http://localhost:30081"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir al Portal del Colaborador
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
}
