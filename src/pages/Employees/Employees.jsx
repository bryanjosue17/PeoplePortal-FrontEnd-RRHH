import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, InputAdornment, MenuItem, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { createEmployee, getAllEmployees } from '../../api/employees';

const contractTypes = [
  { label: 'Indefinido', value: 'Permanent' },
  { label: 'Temporal', value: 'Temporary' },
  { label: 'Prácticas', value: 'Intern' },
  { label: 'Freelance', value: 'Freelance' },
];

const validationSchema = yup.object({
  code: yup.string().required('Requerido'),
  contractType: yup.string(),
  department: yup.string(),
  email: yup.string().email('Email inválido').required('Requerido'),
  emergencyContact: yup.string(),
  fullName: yup.string().required('Requerido'),
  hireDate: yup.string(),
  keycloakId: yup.string(),
  managerId: yup.string(),
  phone: yup.string(),
  position: yup.string(),
  site: yup.string(),
});

const initialForm = {
  code: '', contractType: '', department: '', email: '', emergencyContact: '', fullName: '', hireDate: '', keycloakId: '', managerId: '', phone: '', position: '', site: '',
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formik = useFormik({
    initialValues: initialForm,
    onSubmit: async (values) => {
      try {
        const payload = { ...values, keycloakId: values.keycloakId || crypto.randomUUID() };
        await createEmployee(payload);
        toast.success('Empleado creado exitosamente');
        setDialogOpen(false);
        formik.resetForm();
        load();
      } catch {
        toast.error('Error al crear empleado');
      }
    },
    validationSchema,
  });

  const load = useCallback(() => {
    setLoading(true);
    getAllEmployees()
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter((e) =>
    (e.code?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.department?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.email?.toLowerCase() || '').includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            <PeopleIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Directorio de Empleados</Typography>
            <Typography variant="body2" color="text.secondary">Administración integral del personal, perfiles laborales, puestos y departamentos</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', sm: 'auto' }, background: 'linear-gradient(135deg, #10B981, #059669)', fontWeight: 700 }}>
          Añadir Empleado
        </Button>
        <Box sx={{
          position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0
        }} />
      </Paper>

      <Paper elevation={0} sx={{
        mb: 3,
        p: 2.5,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}>
        <TextField
          fullWidth variant="outlined" placeholder="Buscar por nombre, departamento o email..."
          value={search} onChange={(e) => setSearch(e.target.value)} size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'primary.main' }} /></InputAdornment> } }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
        <TableContainer component={Paper} elevation={0} sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflowX: 'auto',
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((emp) => (
                <TableRow key={emp.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp.id}`)}>
                  <TableCell>{emp.code}</TableCell>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Chip label={emp.status} size="small" color={emp.status === 'Active' ? 'success' : emp.status === 'Suspended' ? 'warning' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No se encontraron empleados</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Por página:"
        />        </>      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Añadir Empleado</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Código" name="code" value={formik.values.code}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code} required />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Nombre Completo" name="fullName" value={formik.values.fullName}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName} required />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Email" name="email" value={formik.values.email}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email} required />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Teléfono" name="phone" value={formik.values.phone}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Departamento" name="department" value={formik.values.department}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  helperText={formik.touched.department && formik.errors.department} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Cargo" name="position" value={formik.values.position}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Fecha de Contratación" name="hireDate" type="date" value={formik.values.hireDate}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                  helperText={formik.touched.hireDate && formik.errors.hireDate}
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Tipo de Contrato" name="contractType" value={formik.values.contractType}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.contractType && Boolean(formik.errors.contractType)}
                  helperText={formik.touched.contractType && formik.errors.contractType}>
                  {contractTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Contacto de Emergencia" name="emergencyContact" value={formik.values.emergencyContact}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.emergencyContact && Boolean(formik.errors.emergencyContact)}
                  helperText={formik.touched.emergencyContact && formik.errors.emergencyContact} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField fullWidth label="Sitio" name="site" value={formik.values.site}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.site && Boolean(formik.errors.site)}
                  helperText={formik.touched.site && formik.errors.site} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Manager ID" name="managerId" value={formik.values.managerId}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.managerId && Boolean(formik.errors.managerId)}
                  helperText={formik.touched.managerId && formik.errors.managerId} />
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
