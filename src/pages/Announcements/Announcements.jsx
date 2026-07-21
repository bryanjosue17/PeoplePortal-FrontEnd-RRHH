import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import {
  Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  MenuItem, Paper, TextField, Typography
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
  const [confirmId, setConfirmId] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');

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

  const handleDeactivate = (id, title) => {
    setConfirmId(id);
    setConfirmTitle(title);
  };

  const handleConfirmDeactivate = async () => {
    const id = confirmId;
    setConfirmId(null);
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
      {/* Glassmorphic Header Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(52,211,153,0.06) 100%)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          mb: 4,
          p: { xs: 2.5, md: 3.5 },
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: '5px solid #10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: 2.5, background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#022C22', display: 'flex', boxShadow: '0 6px 16px rgba(16,185,129,0.3)' }}>
            <CampaignIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Comunicados institucionales</Typography>
            <Typography variant="body2" color="text.secondary">Creación, publicación y control de avisos, boletines y comunicados oficiales para la organización</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', sm: 'auto' }, background: 'linear-gradient(135deg, #10B981, #059669)', fontWeight: 700 }}>
          Nuevo Comunicado
        </Button>
        <Box sx={{
          position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0
        }} />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {announcements.length === 0 && (
            <Grid size={12}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 4,
              }}>
                <Typography color="text.secondary" align="center">No hay comunicados activos</Typography>
              </Card>
            </Grid>
          )}
          {announcements.map((ann) => (
            <Grid size={{ md: 6, xs: 12 }} key={ann.id}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'divider',
                borderTop: `4px solid ${ann.type === 'Urgente' ? '#f44336' : ann.type === 'HR' ? '#10B981' : '#3B82F6'}`,
                borderRadius: 3,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
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
                    <Button size="small" color="error" onClick={() => handleDeactivate(ann.id, ann.title)}>Desactivar</Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de confirmación de desactivación */}
      <Dialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Desactivar comunicado</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas desactivar el comunicado <strong>"{confirmTitle}"</strong>? Dejará de ser visible para los colaboradores.</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmId(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeactivate}>Desactivar</Button>
        </DialogActions>
      </Dialog>

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
