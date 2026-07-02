import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';

const ALLOWED_ROLES = ['hr', 'admin'];

export default function ProtectedRoute({ children }) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!keycloak?.authenticated) {return null;}

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const hasAccess = roles.some(r => ALLOWED_ROLES.includes(r));

  if (!hasAccess) {
    return (
      <Box sx={{ alignItems: 'center', bgcolor: 'background.default', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ maxWidth: 480, p: 6, textAlign: 'center' }}>
          <LockIcon sx={{ color: 'error.main', fontSize: 64, mb: 2 }} />
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
