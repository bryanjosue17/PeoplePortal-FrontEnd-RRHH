import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #022C22 0%, #065F46 45%, #047857 100%)',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Orbs decorativos — tonos verdes */}
      <Box
        sx={{
          animation: 'floatRRHH 9s ease-in-out infinite',
          background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          height: 650,
          left: -250,
          position: 'absolute',
          top: -200,
          width: 650,
          '@keyframes floatRRHH': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-25px) scale(1.04)' },
          },
        }}
      />
      <Box
        sx={{
          animation: 'floatRRHH 12s ease-in-out infinite reverse',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: -220,
          height: 550,
          position: 'absolute',
          right: -180,
          width: 550,
        }}
      />
      {/* Tercer orb superior derecha */}
      <Box
        sx={{
          animation: 'floatRRHH 7s ease-in-out infinite',
          background: 'radial-gradient(circle, rgba(6,95,70,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          height: 300,
          position: 'absolute',
          right: 80,
          top: 40,
          width: 300,
        }}
      />

      {/* Card de login */}
      <Box
        sx={{
          backdropFilter: 'blur(24px)',
          background: 'rgba(2, 44, 34, 0.88)',
          border: '1px solid rgba(52,211,153,0.22)',
          borderRadius: 4,
          boxShadow: '0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(52,211,153,0.12)',
          maxWidth: 420,
          mx: 2,
          p: { sm: 5, xs: 4 },
          position: 'relative',
          width: '100%',
          zIndex: 1,
        }}
      >
        {/* Logo + Nombre */}
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', mb: 4 }}>
          <Box
            sx={{
              alignItems: 'center',
              background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              color: '#022C22',
              display: 'flex',
              fontSize: 28,
              fontWeight: 900,
              height: 64,
              justifyContent: 'center',
              mb: 2.5,
              width: 64,
            }}
          >
            P
          </Box>
          <Typography
            variant="h5"
            sx={{ color: '#ECFDF5', fontWeight: 700, letterSpacing: '-0.01em', mb: 0.5 }}
          >
            PeoplePortal
          </Typography>
          <Typography
            variant="caption"
            sx={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: 10,
              boxShadow: '0 0 12px rgba(52, 211, 153, 0.2)',
              color: '#6EE7B7',
              fontWeight: 700,
              letterSpacing: '0.12em',
              px: 2,
              py: 0.4,
              textTransform: 'uppercase',
            }}
          >
            RRHH
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#6EE7B7', mb: 3, textAlign: 'center' }}>
          Acceso exclusivo para Recursos Humanos
        </Typography>

        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 2,
              color: '#FCA5A5',
              mb: 2.5,
              '& .MuiAlert-icon': { color: '#F87171' },
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="login-username-rrhh"
            autoComplete="username"
            autoFocus
            disabled={loading}
            fullWidth
            label="Usuario"
            margin="normal"
            onChange={(e) => setUsername(e.target.value)}
            required
            size="medium"
            value={username}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlinedIcon sx={{ color: '#34D399', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(2, 44, 34, 0.7)',
                color: '#ECFDF5',
                '& fieldset': { borderColor: 'rgba(52,211,153,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(52,211,153,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#34D399' },
              },
              '& .MuiInputLabel-root': { color: '#6EE7B7' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#34D399' },
            }}
          />

          <TextField
            id="login-password-rrhh"
            autoComplete="current-password"
            disabled={loading}
            fullWidth
            label="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
            size="medium"
            type={showPassword ? 'text' : 'password'}
            value={password}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#34D399', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      edge="end"
                      onClick={() => setShowPassword((s) => !s)}
                      sx={{ color: '#6EE7B7' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(2, 44, 34, 0.7)',
                color: '#ECFDF5',
                '& fieldset': { borderColor: 'rgba(52,211,153,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(52,211,153,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#34D399' },
              },
              '& .MuiInputLabel-root': { color: '#6EE7B7' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#34D399' },
            }}
          />

          <Button
            id="login-submit-btn-rrhh"
            disabled={loading || !username || !password}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            sx={{
              background: loading
                ? 'rgba(16,185,129,0.4)'
                : 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
              borderRadius: 2.5,
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              color: '#022C22',
              fontWeight: 700,
              height: 50,
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)',
                boxShadow: '0 6px 28px rgba(16,185,129,0.55)',
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
              '&.Mui-disabled': {
                background: 'rgba(2, 44, 34, 0.9) !important',
                border: '1px solid rgba(52, 211, 153, 0.18)',
                color: '#4B5563 !important',
              },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#022C22' }} /> : 'Iniciar Sesión'}
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: 'rgba(110,231,183,0.4)', display: 'block', mt: 4, textAlign: 'center' }}
        >
          © {new Date().getFullYear()} PeoplePortal — Acceso restringido RRHH
        </Typography>
      </Box>
    </Box>
  );
}
