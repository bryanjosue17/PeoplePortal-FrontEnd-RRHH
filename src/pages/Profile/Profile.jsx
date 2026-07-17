import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import { Alert, Box, Button, Card, Chip, Divider, Grid, Skeleton, TextField, Typography, Paper } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { getMyProfile, updateMyProfile } from '../../api/employees';
import { useAuth } from '../../context/AuthContext';
import DiceAvatar from '../../components/DiceAvatar';

const validationSchema = yup.object({
  emergencyContact: yup.string(),
  emergencyPhone: yup.string(),
  phone: yup.string(),
  site: yup.string(),
});

function Profile() {
  const { user } = useAuth(); // keycloak parsed token
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const formik = useFormik({
    initialValues: { emergencyContact: '', emergencyPhone: '', phone: '', site: '' },
    onSubmit: async (values) => {
      try {
        const res = await updateMyProfile(values);
        setProfile(res.data);
        setEditing(false);
        toast.success('Perfil actualizado exitosamente');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al actualizar perfil');
      }
    },
    validationSchema,
  });

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const p = res.data;
        setProfile(p);
        formik.setValues({
          emergencyContact: p.emergencyContact || '',
          emergencyPhone: p.emergencyPhone || '',
          phone: p.phone || '',
          site: p.site || '',
        });
      })
      .catch(() => {
        // Fallback a perfil vacío si el usuario de RRHH aún no tiene registro físico en tabla Employees
        const p = {};
        setProfile(p);
        formik.setValues({
          emergencyContact: '',
          emergencyPhone: '',
          phone: '',
          site: '',
        });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    formik.setValues({
      emergencyContact: profile?.emergencyContact || '',
      emergencyPhone: profile?.emergencyPhone || '',
      phone: profile?.phone || '',
      site: profile?.site || '',
    });
    setEditing(false);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar el perfil: {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid size={{ md: 8, xs: 12 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.name || user?.preferred_username || 'Administrador';
  const displayEmail = profile?.email || user?.email || 'admin@forza.com';
  const roles = user?.realm_access?.roles?.filter(r => !['offline_access', 'uma_authorization', 'default-roles-peopleportal'].includes(r)) || [];

  return (
    <Box>
      {/* Banner Superior */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.05) 100%)',
          borderRadius: 3,
          mb: 4,
          p: { xs: 3, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
            <DiceAvatar seed={displayEmail} size={120} sx={{ border: '4px solid', borderColor: 'background.paper' }} />
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
              {fullName}
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 2 }}>
              {profile?.position || 'Personal de RRHH'}
            </Typography>
            <Chip 
              icon={<SecurityIcon />} 
              label="Cuenta Activa" 
              color="success" 
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
        
        {/* Background Decorative Element */}
        <Box sx={{
          position: 'absolute', right: -50, top: -50, width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0
        }} />
      </Paper>

      <Grid container spacing={3}>
        {/* Información de Cuenta */}
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ p: 4, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Detalles de Cuenta Administrativa</Typography>
            <Divider sx={{ mb: 4 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BadgeIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Nombre de Usuario (SSO)</Typography>
                  <Typography variant="body1" fontWeight={500}>{user?.preferred_username || profile?.documentNumber || 'No registrado'}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Correo Electrónico</Typography>
                  <Typography variant="body1" fontWeight={500}>{displayEmail}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WorkIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Departamento</Typography>
                  <Typography variant="body1" fontWeight={500}>{profile?.department || 'Recursos Humanos'}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Sede Principal</Typography>
                  <Typography variant="body1" fontWeight={500}>{profile?.site || 'Central Administrativa'}</Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 5, mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
              Roles en Sistema (Keycloak)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {roles.length > 0 ? roles.map(r => (
                <Chip key={r} label={r} size="medium" sx={{ borderRadius: 1 }} color={r === 'hr' || r === 'admin' ? 'primary' : 'default'} />
              )) : (
                <Typography variant="body2" color="text.disabled">Sin roles asignados</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Contacto y Emergencia (Derecha - Componente Exacto de Colaborador) */}
        <Grid size={{ md: 8, xs: 12 }}>
          <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>Información de Contacto</Typography>
              {!editing && (
                <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ borderRadius: 2 }}>
                  Editar Perfil
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 4 }} />

            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Teléfono Personal</Typography>
                  <TextField fullWidth name="phone" value={formik.values.phone}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    disabled={!editing}
                    placeholder="Ej. +502 1234 5678"
                    InputProps={{ startAdornment: <PhoneIcon fontSize="small" sx={{ color: 'action.active', mr: 1.5 }} /> }} 
                  />
                </Grid>
                
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Sede de Trabajo</Typography>
                  <TextField fullWidth name="site" value={formik.values.site}
                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.site && Boolean(formik.errors.site)}
                    helperText={formik.touched.site && formik.errors.site}
                    disabled={!editing}
                    placeholder="Ej. Edificio Central"
                    InputProps={{ startAdornment: <BusinessIcon fontSize="small" sx={{ color: 'action.active', mr: 1.5 }} /> }} 
                  />
                </Grid>
                
                <Grid size={12}>
                  <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, mt: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>En caso de emergencia</Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ sm: 6, xs: 12 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Nombre de Contacto</Typography>
                        <TextField fullWidth name="emergencyContact" value={formik.values.emergencyContact}
                          onChange={formik.handleChange} onBlur={formik.handleBlur}
                          error={formik.touched.emergencyContact && Boolean(formik.errors.emergencyContact)}
                          helperText={formik.touched.emergencyContact && formik.errors.emergencyContact}
                          disabled={!editing} 
                          placeholder="Nombre completo"
                        />
                      </Grid>
                      <Grid size={{ sm: 6, xs: 12 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Teléfono de Emergencia</Typography>
                        <TextField fullWidth name="emergencyPhone" value={formik.values.emergencyPhone}
                          onChange={formik.handleChange} onBlur={formik.handleBlur}
                          error={formik.touched.emergencyPhone && Boolean(formik.errors.emergencyPhone)}
                          helperText={formik.touched.emergencyPhone && formik.errors.emergencyPhone}
                          disabled={!editing} 
                          placeholder="Ej. +502 8765 4321"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {editing && (
                  <Grid size={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                      <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={formik.isSubmitting} sx={{ borderRadius: 2 }}>
                        Cancelar
                      </Button>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={formik.handleSubmit} disabled={formik.isSubmitting} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                        {formik.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;
