import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getActiveAnnouncements, createAnnouncement } from '../../api/announcements';

const announcementTypes = ['General', 'HR', 'IT', 'Payroll', 'Event'];

const validationSchema = yup.object({
  title: yup.string().required('Requerido'),
  body: yup.string().required('Requerido'),
  type: yup.string(),
  expiresAt: yup.string(),
});

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: { title: '', body: '', type: 'General', expiresAt: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createAnnouncement(values);
        toast.success('Comunicado creado exitosamente');
        setDialogOpen(false);
        formik.resetForm();
        load();
      } catch {
        toast.error('Error al crear comunicado');
      }
    },
  });

  const load = () => {
    setLoading(true);
    getActiveAnnouncements()
      .then((res) => setAnnouncements(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id) => {
    try {
      await createAnnouncement({ id });
      load();
    } catch {
      // error
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="h4">Comunicados</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Nuevo Comunicado
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {announcements.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center">No hay comunicados activos</Typography>
            </Grid>
          )}
          {announcements.map((ann) => (
            <Grid size={{ xs: 12, md: 6 }} key={ann.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{ann.title}</Typography>
                    <Chip label={ann.type} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                    {ann.body}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={ann.status || 'Active'} size="small" color="success" />
                    {ann.expiresAt && (
                      <Typography variant="caption" color="text.secondary">
                        Expira: {new Date(ann.expiresAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                {ann.status !== 'Inactive' && (
                  <CardActions>
                    <Button size="small" color="error" onClick={() => handleDeactivate(ann.id)}>Desactivar</Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Comunicado</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Título" name="title" value={formik.values.title}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title} required />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Tipo" name="type" value={formik.values.type}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select>
                  {announcementTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Fecha de Expiración" name="expiresAt" type="date" value={formik.values.expiresAt}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Contenido" name="body" multiline rows={4} value={formik.values.body}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.body && Boolean(formik.errors.body)}
                  helperText={formik.touched.body && formik.errors.body} required />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
