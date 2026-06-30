import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, CircularProgress,
  Alert, Paper, Divider
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { getAllBenefits } from '../../api/benefits';

const typeColors = {
  Salud: 'error',
  Educación: 'primary',
  Alimentación: 'success',
  Transporte: 'warning',
  Bienestar: 'secondary',
  Bonificación: 'info',
  Descuento: 'default',
};

export default function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getAllBenefits()
      .then((res) => setBenefits(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>Beneficios</Typography>
        <Alert severity="error">Error al cargar beneficios: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CardGiftcardIcon color="primary" />
        <Typography variant="h5" fontWeight={600}>Beneficios</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'info.50' }}>
        <Typography variant="body2" color="text.secondary">
          Catálogo de beneficios disponibles para los colaboradores. Para agregar o modificar beneficios, contacta al administrador del sistema.
        </Typography>
      </Paper>

      {benefits.length === 0 ? (
        <Alert severity="info">No hay beneficios registrados en el sistema.</Alert>
      ) : (
        <Grid container spacing={3}>
          {benefits.map((benefit) => (
            <Grid item xs={12} sm={6} md={4} key={benefit.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                      {benefit.name}
                    </Typography>
                    <Chip
                      label={benefit.type}
                      color={typeColors[benefit.type] || 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  {benefit.description && (
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ px: 2, pb: 1.5 }}>
                  <Chip
                    label={benefit.isActive ? 'Activo' : 'Inactivo'}
                    color={benefit.isActive ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
