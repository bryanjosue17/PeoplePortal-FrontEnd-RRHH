import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import {
  Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  MenuItem, TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { createAnnouncement, deactivateAnnouncement, getActiveAnnouncements } from '../../api/announcements';

const announcementTypes = ['News', 'HrNotice', 'PolicyChange', 'Event', 'Reminder', 'Birthday', 'Institutional'];

const validationSchema = yup.object({
  body: yup.string().required('Requerido'),
  expiresAt: yup.string(),
  title: yup.string().required('Requerido'),
  type: yup.string(),
});

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: { body: '', expiresAt: '', title: '', type: 'News' },
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
    validationSchema,
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
      await deactivateAnnouncement(id);
      toast.success('Comunicado desactivado');
      load();
    } catch {
      toast.error('Error al desactivar comunicado');
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <CampaignIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Comunicados</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { sm: 'auto', xs: '100%' } }}>
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
            <Grid size={{ md: 6, xs: 12 }} key={ann.id}>
              <Card sx={{
                borderTop: `3px solid ${ann.type === 'Urgente' ? '#f44336' : ann.type === 'HR' ? '#34D399' : '#60A5FA'}`,
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' },
              }}>
                <CardContent>
                  <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{ann.title}</Typography>
                    <Chip label={ann.type} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                    {ann.body}
                  </Typography>
                  <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
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
          <DialogActions sx={{ justifyContent: 'flex-start', pb: 2, px: 3 }}>
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
