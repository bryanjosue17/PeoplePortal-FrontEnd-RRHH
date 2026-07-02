import AddIcon from '@mui/icons-material/Add';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { createEmployee, getAllEmployees } from '../../api/employees';

const contractTypes = ['Indefinido', 'Temporal', 'Prácticas', 'Freelance'];

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: initialForm,
    onSubmit: async (values) => {
      try {
        await createEmployee(values);
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
    (e.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.department?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleClose = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Empleados</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { sm: 'auto', xs: '100%' } }}>
          Añadir Empleado
        </Button>
      </Box>
      <TextField
        fullWidth variant="outlined" placeholder="Buscar por nombre, departamento o email..."
        value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((emp) => (
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
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Añadir Empleado</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Keycloak ID" name="keycloakId" value={formik.values.keycloakId}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.keycloakId && Boolean(formik.errors.keycloakId)}
                  helperText={formik.touched.keycloakId && formik.errors.keycloakId} />
              </Grid>
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
                  {contractTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
