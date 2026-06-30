import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, CircularProgress,
  Alert, Paper, Divider, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllBenefits, createBenefit, updateBenefit, deactivateBenefit } from '../../api/benefits';

const typeColors = {
  Salud: 'error',
  Educación: 'primary',
  Alimentación: 'success',
  Transporte: 'warning',
  Bienestar: 'secondary',
  Bonificación: 'info',
  Descuento: 'default',
};

const benefitTypes = ['Salud', 'Educación', 'Alimentación', 'Transporte', 'Bienestar', 'Bonificación', 'Descuento', 'Otro'];

const emptyForm = { name: '', type: 'Otro', description: '' };

export default function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAllBenefits()
      .then((res) => setBenefits(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (benefit) => {
    setEditingId(benefit.id);
    setForm({ name: benefit.name, type: benefit.type, description: benefit.description || '' });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateBenefit(editingId, { name: form.name, description: form.description });
      } else {
        await createBenefit({ name: form.name, type: form.type, description: form.description });
      }
      handleClose();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`¿Desactivar beneficio "${name}"?`)) return;
    try {
      await deactivateBenefit(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardGiftcardIcon color="primary" />
          <Typography variant="h5" fontWeight={600}>Beneficios</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nuevo Beneficio
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {benefits.length === 0 ? (
        <Alert severity="info">No hay beneficios registrados en el sistema.</Alert>
      ) : (
        <Grid container spacing={3}>
          {benefits.map((benefit) => (
            <Grid item xs={12} sm={6} md={4} key={benefit.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: benefit.isActive ? 1 : 0.6 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                      {benefit.name}
                    </Typography>
                    <Chip label={benefit.type} color={typeColors[benefit.type] || 'default'} size="small" sx={{ ml: 1 }} />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  {benefit.description && (
                    <Typography variant="body2" color="text.secondary">{benefit.description}</Typography>
                  )}
                </CardContent>
                <Box sx={{ px: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={benefit.isActive ? 'Activo' : 'Inactivo'} color={benefit.isActive ? 'success' : 'default'} size="small" variant="outlined" />
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(benefit)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {benefit.isActive && (
                      <Tooltip title="Desactivar">
                        <IconButton size="small" color="error" onClick={() => handleDeactivate(benefit.id, benefit.name)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Beneficio' : 'Nuevo Beneficio'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nombre" required fullWidth value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {!editingId && (
              <TextField label="Tipo" select fullWidth value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {benefitTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            )}
            <TextField label="Descripción" multiline rows={3} fullWidth value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name.trim() || saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
