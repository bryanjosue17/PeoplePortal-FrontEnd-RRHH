import AddIcon from '@mui/icons-material/Add';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton,
  MenuItem,
  TextField, Tooltip, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { createBenefit, deactivateBenefit, getAllBenefits, updateBenefit } from '../../api/benefits';

const typeColors = {
  'Alimentación': 'success', Bienestar: 'secondary', 'Bonificación': 'info', Descuento: 'default', 'Educación': 'primary', Salud: 'error', Transporte: 'warning',
};

const benefitTypes = ['Salud', 'Educación', 'Alimentación', 'Transporte', 'Bienestar', 'Bonificación', 'Descuento', 'Otro'];

const validationSchema = yup.object({
  description: yup.string(),
  name: yup.string().required('Requerido'),
  type: yup.string(),
});

export default function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const formik = useFormik({
    initialValues: { description: '', name: '', type: 'Otro' },
    onSubmit: async (values) => {
      try {
        if (editingId) {
          await updateBenefit(editingId, { name: values.name, description: values.description });
          toast.success('Beneficio actualizado exitosamente');
        } else {
          await createBenefit({ name: values.name, type: values.type, description: values.description });
          toast.success('Beneficio creado exitosamente');
        }
        handleClose();
        load();
      } catch (err) {
        toast.error(err.message || 'Error al guardar beneficio');
      }
    },
    validationSchema,
  });

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
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (benefit) => {
    setEditingId(benefit.id);
    formik.setValues({ description: benefit.description || '', name: benefit.name, type: benefit.type });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`¿Desactivar beneficio "${name}"?`)) {return;}
    try {
      await deactivateBenefit(id);
      toast.success('Beneficio desactivado');
      load();
    } catch (err) {
      toast.error(err.message || 'Error al desactivar beneficio');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <CardGiftcardIcon color="primary" />
          <Typography variant="h5" fontWeight={600}>Beneficios</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Nuevo Beneficio</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {benefits.length === 0 ? (
        <Alert severity="info">No hay beneficios registrados en el sistema.</Alert>
      ) : (
        <Grid container spacing={3}>
          {benefits.map((benefit) => (
            <Grid size={{ md: 4, sm: 6, xs: 12 }} key={benefit.id}>
              <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: benefit.isActive ? 1 : 0.6 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{benefit.name}</Typography>
                    <Chip label={benefit.type} color={typeColors[benefit.type] || 'default'} size="small" sx={{ ml: 1 }} />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  {benefit.description && (
                    <Typography variant="body2" color="text.secondary">{benefit.description}</Typography>
                  )}
                </CardContent>
                <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', pb: 1.5, px: 2 }}>
                  <Chip label={benefit.isActive ? 'Activo' : 'Inactivo'} color={benefit.isActive ? 'success' : 'default'} size="small" variant="outlined" />
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(benefit)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    {benefit.isActive && (
                      <Tooltip title="Desactivar">
                        <IconButton size="small" color="error" onClick={() => handleDeactivate(benefit.id, benefit.name)}><DeleteIcon fontSize="small" /></IconButton>
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
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Nombre" name="name" value={formik.values.name}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name} required />
              </Grid>
              {!editingId && (
                <Grid size={12}>
                  <TextField fullWidth label="Tipo" name="type" value={formik.values.type}
                    onChange={formik.handleChange} onBlur={formik.handleBlur} select>
                    {benefitTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
              <Grid size={12}>
                <TextField fullWidth label="Descripción" name="description" multiline rows={3} value={formik.values.description}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', pb: 2, px: 3 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
