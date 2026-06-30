import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getEmployeeById, updateEmployee } from '../../api/employees';
import { getAllDocuments } from '../../api/hrDocuments';
import { getAllRequests } from '../../api/hrRequests';

const contractTypes = ['Indefinido', 'Temporal', 'Prácticas', 'Freelance'];
const statusOptions = ['Active', 'Inactive', 'Suspended'];

const validationSchema = yup.object({
  department: yup.string(),
  position: yup.string(),
  contractType: yup.string(),
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
    initialValues: { department: '', position: '', contractType: '', status: 'Active' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateEmployee(id, values);
        setEditOpen(false);
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch {
        // error
      }
    },
  });

  useEffect(() => {
    Promise.all([getEmployeeById(id), getAllDocuments(), getAllRequests()])
      .then(([empRes, docRes, reqRes]) => {
        setEmployee(empRes.data);
        formik.setValues({
          department: empRes.data.department || '',
          position: empRes.data.position || '',
          contractType: empRes.data.contractType || '',
          status: empRes.data.status || 'Active',
        });
        const docs = Array.isArray(docRes.data) ? docRes.data : [];
        const reqs = Array.isArray(reqRes.data) ? reqRes.data : [];
        setDocuments(docs.filter((d) => d.employeeId === id || d.employeeId === empRes.data.employeeId));
        setRequests(reqs.filter((r) => r.employeeId === id || r.employeeId === empRes.data.employeeId));
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Typography variant="h5">Información del Empleado</Typography>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setEditOpen(true); formik.setValues({ department: employee.department || '', position: employee.position || '', contractType: employee.contractType || '', status: employee.status || 'Active' }); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Editar
            </Button>
          </Box>
          <Grid container spacing={2}>
            {infoRows.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.label}>
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Departamento" name="department" value={formik.values.department}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.department && Boolean(formik.errors.department)}
                  helperText={formik.touched.department && formik.errors.department} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Cargo" name="position" value={formik.values.position}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.position && Boolean(formik.errors.position)}
                  helperText={formik.touched.position && formik.errors.position} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Tipo de Contrato" name="contractType" value={formik.values.contractType}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.contractType && Boolean(formik.errors.contractType)}
                  helperText={formik.touched.contractType && formik.errors.contractType}>
                  {contractTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth label="Estado" name="status" value={formik.values.status}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}>
                  {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
