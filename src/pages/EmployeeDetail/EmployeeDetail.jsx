import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, MenuItem, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { getEmployeeById, updateEmployee } from '../../api/employees';
import { getAllDocuments } from '../../api/hrDocuments';
import { getAllRequests } from '../../api/hrRequests';

const contractTypes = ['Indefinido', 'Temporal', 'Prácticas', 'Freelance'];
const statusOptions = ['Active', 'Inactive', 'Suspended'];

const validationSchema = yup.object({
  contractType: yup.string(),
  department: yup.string(),
  position: yup.string(),
  status: yup.string(),
});

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const formik = useFormik({
    initialValues: { contractType: '', department: '', position: '', status: 'Active' },
    onSubmit: async (values) => {
      try {
        await updateEmployee(id, values);
        toast.success('Empleado actualizado exitosamente');
        setEditOpen(false);
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch {
        toast.error('Error al actualizar empleado');
      }
    },
    validationSchema,
  });

  useEffect(() => {
    Promise.all([getEmployeeById(id), getAllDocuments(), getAllRequests()])
      .then(([empRes, docRes, reqRes]) => {
        setEmployee(empRes.data);
        formik.setValues({
          contractType: empRes.data.contractType || '',
          department: empRes.data.department || '',
          position: empRes.data.position || '',
          status: empRes.data.status || 'Active',
        });
        const docs = Array.isArray(docRes.data) ? docRes.data : [];
        const reqs = Array.isArray(reqRes.data) ? reqRes.data : [];
        setDocuments(docs.filter((d) => d.employeeId === id || d.employeeId === empRes.data.keycloakId || d.employeeId === empRes.data.id));
        setRequests(reqs.filter((r) => r.employeeId === id || r.employeeId === empRes.data.keycloakId || r.employeeId === empRes.data.id));
      })
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (!employee) {
    return <Typography>Empleado no encontrado</Typography>;
  }

  const infoRows = [
    { label: 'Código', value: employee.code },
    { label: 'Nombre Completo', value: employee.fullName },
    { label: 'Email', value: employee.email },
    { label: 'Teléfono', value: employee.phone },
    { label: 'Departamento', value: employee.department },
    { label: 'Cargo', value: employee.position },
    { label: 'Fecha de Contratación', value: employee.hireDate },
    { label: 'Tipo de Contrato', value: employee.contractType },
    { label: 'Contacto de Emergencia', value: employee.emergencyContact },
    { label: 'Sitio', value: employee.site },
    { label: 'Manager ID', value: employee.managerId },
    { label: 'Estado', value: <Chip label={employee.status} color={employee.status === 'Active' ? 'success' : employee.status === 'Suspended' ? 'warning' : 'default'} size="small" /> },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ mb: 2 }}>
        Volver a Empleados
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Información del Empleado</Typography>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setEditOpen(true); formik.setValues({ contractType: employee.contractType || '', department: employee.department || '', position: employee.position || '', status: employee.status || 'Active' }); }} sx={{ width: { sm: 'auto', xs: '100%' } }}>
              Editar
            </Button>
          </Box>
          <Grid container spacing={2}>
            {infoRows.map((row) => (
              <Grid size={{ md: 4, sm: 6, xs: 12 }} key={row.label}>
                <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                <Typography variant="body1">{row.value}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 1 }}>Documentos</Typography>
      <TableContainer component={Paper} sx={{ mb: 3, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Nombre</TableCell><TableCell>Tipo</TableCell><TableCell>Estado</TableCell><TableCell>Subido</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">Sin documentos</TableCell></TableRow>
            ) : documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell><Chip label={doc.status} size="small" color={doc.status === 'Approved' ? 'success' : doc.status === 'Rejected' ? 'error' : 'warning'} /></TableCell>
                <TableCell>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mb: 1 }}>Solicitudes</Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Tipo</TableCell><TableCell>Estado</TableCell><TableCell>Creado</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center">Sin solicitudes</TableCell></TableRow>
            ) : requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.type}</TableCell>
                <TableCell><Chip label={req.status} size="small" color={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'} /></TableCell>
                <TableCell>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Empleado</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Departamento" name="department" value={formik.values.department}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  helperText={formik.touched.department && formik.errors.department} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Cargo" name="position" value={formik.values.position}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Tipo de Contrato" name="contractType" value={formik.values.contractType}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.contractType && Boolean(formik.errors.contractType)}
                  helperText={formik.touched.contractType && formik.errors.contractType}>
                  {contractTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Estado" name="status" value={formik.values.status}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}>
                  {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', pb: 2, px: 3 }}>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
