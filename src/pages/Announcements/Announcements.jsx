import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getActiveAnnouncements, createAnnouncement } from '../../api/announcements';

const announcementTypes = ['General', 'HR', 'IT', 'Payroll', 'Event'];

const initialForm = { title: '', body: '', type: 'General', expiresAt: '' };

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getActiveAnnouncements()
      .then((res) => setAnnouncements(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createAnnouncement(form);
      setDialogOpen(false);
      setForm(initialForm);
      load();
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await createAnnouncement({ ...form, id });
      load();
    } catch {
      // error
    }
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
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">No hay comunicados activos</Typography>
            </Grid>
          )}
          {announcements.map((ann) => (
            <Grid item xs={12} md={6} key={ann.id}>
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
                    <Button size="small" color="error" onClick={() => handleDeactivate(ann.id)}>
                      Desactivar
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Comunicado</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Título" name="title" value={form.title} onChange={handleChange} fullWidth required />
            <TextField label="Contenido" name="body" value={form.body} onChange={handleChange} fullWidth multiline rows={4} required />
            <TextField label="Tipo" name="type" value={form.type} onChange={handleChange} fullWidth select>
              {announcementTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Fecha de Expiración" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>{saving ? 'Creando...' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
