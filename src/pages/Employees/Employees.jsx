import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getAllEmployees, createEmployee } from '../../api/employees';

const contractTypes = ['Indefinido', 'Temporal', 'Prácticas', 'Freelance'];

const validationSchema = yup.object({
  code: yup.string().required('Requerido'),
  fullName: yup.string().required('Requerido'),
  email: yup.string().email('Email inválido').required('Requerido'),
  keycloakId: yup.string(),
  phone: yup.string(),
  department: yup.string(),
  position: yup.string(),
  hireDate: yup.string(),
  contractType: yup.string(),
  emergencyContact: yup.string(),
  site: yup.string(),
  managerId: yup.string(),
});

const initialForm = {
  keycloakId: '', code: '', fullName: '', email: '', phone: '',
  department: '', position: '', hireDate: '', contractType: '',
  emergencyContact: '', site: '', managerId: '',
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: initialForm,
    validationSchema,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="h4">Empleados</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
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
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Keycloak ID" name="keycloakId" value={formik.values.keycloakId}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.keycloakId && Boolean(formik.errors.keycloakId)}
                  helperText={formik.touched.keycloakId && formik.errors.keycloakId} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Código" name="code" value={formik.values.code}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code} required />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Nombre Completo" name="fullName" value={formik.values.fullName}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName} required />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Email" name="email" value={formik.values.email}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email} required />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Teléfono" name="phone" value={formik.values.phone}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Departamento" name="department" value={formik.values.department}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  helperText={formik.touched.department && formik.errors.department} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Cargo" name="position" value={formik.values.position}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Fecha de Contratación" name="hireDate" type="date" value={formik.values.hireDate}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                  helperText={formik.touched.hireDate && formik.errors.hireDate}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Tipo de Contrato" name="contractType" value={formik.values.contractType}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.contractType && Boolean(formik.errors.contractType)}
                  helperText={formik.touched.contractType && formik.errors.contractType}>
                  {contractTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Contacto de Emergencia" name="emergencyContact" value={formik.values.emergencyContact}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.emergencyContact && Boolean(formik.errors.emergencyContact)}
                  helperText={formik.touched.emergencyContact && formik.errors.emergencyContact} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Sitio" name="site" value={formik.values.site}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.site && Boolean(formik.errors.site)}
                  helperText={formik.touched.site && formik.errors.site} />
              </Grid>
              <Grid item xs={12} sm={12} lg={6}>
                <TextField fullWidth label="Manager ID" name="managerId" value={formik.values.managerId}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.managerId && Boolean(formik.errors.managerId)}
                  helperText={formik.touched.managerId && formik.errors.managerId} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
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
