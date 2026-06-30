import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem, Autocomplete, Stack, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getAllDocuments, uploadDocument, updateDocumentStatus } from '../../api/hrDocuments';
import { getAllEmployees } from '../../api/employees';

const documentTypes = ['Contract', 'ID', 'Payroll', 'Tax', 'Medical', 'Other'];
const statusColors = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

const validationSchema = yup.object({
  name: yup.string().required('Requerido'),
  type: yup.string().required('Requerido'),
  fileUrl: yup.string(),
  expiresAt: yup.string(),
});

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const formik = useFormik({
    initialValues: { name: '', type: '', fileUrl: '', expiresAt: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await uploadDocument({ ...values, employeeId: selectedEmployee?.id || '' });
        toast.success('Documento subido exitosamente');
        setDialogOpen(false);
        setSelectedEmployee(null);
        formik.resetForm();
        load();
      } catch {
        toast.error('Error al subir documento');
      }
    },
  });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllDocuments(), getAllEmployees()])
      .then(([docRes, empRes]) => {
        setDocuments(Array.isArray(docRes.data) ? docRes.data : []);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      })
      .catch(() => { setDocuments([]); setEmployees([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = documents.filter((d) => {
    const emp = employees.find((e) => e.id === d.employeeId);
    const empName = emp?.fullName || '';
    const matchSearch = empName.toLowerCase().includes(search.toLowerCase()) ||
      (d.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? d.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id, status) => {
    try {
      await updateDocumentStatus(id, { status });
      toast.success(`Documento ${status === 'Approved' ? 'aprobado' : 'rechazado'} exitosamente`);
      load();
    } catch {
      toast.error('Error al actualizar estado del documento');
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
    formik.resetForm();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="h4">Documentos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Subir Documento
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField fullWidth variant="outlined" placeholder="Buscar por empleado o nombre..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField select label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="Pending">Pendiente</MenuItem>
          <MenuItem value="Approved">Aprobado</MenuItem>
          <MenuItem value="Rejected">Rechazado</MenuItem>
        </TextField>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell><TableCell>Nombre</TableCell><TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell><TableCell>Subido</TableCell><TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((doc) => {
                const emp = employees.find((e) => e.id === doc.employeeId);
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{emp?.fullName || doc.employeeId}</TableCell>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell><Chip label={doc.status} size="small" color={statusColors[doc.status] || 'default'} /></TableCell>
                    <TableCell>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {doc.status === 'Pending' && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
                          <Button size="small" color="success" variant="outlined" onClick={() => handleStatusChange(doc.id, 'Approved')}>Aprobar</Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleStatusChange(doc.id, 'Rejected')}>Rechazar</Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No se encontraron documentos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(opt) => `${opt.fullName} (${opt.code})`}
                  value={selectedEmployee}
                  onChange={(_, v) => setSelectedEmployee(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Empleado" fullWidth required
                      error={!selectedEmployee && formik.submitCount > 0}
                      helperText={!selectedEmployee && formik.submitCount > 0 ? 'Requerido' : ''} />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Nombre del Documento" name="name" value={formik.values.name}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name} required />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Tipo" name="type" value={formik.values.type}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} select required
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}>
                  {documentTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="URL del Archivo" name="fileUrl" value={formik.values.fileUrl}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.fileUrl && Boolean(formik.errors.fileUrl)}
                  helperText={formik.touched.fileUrl && formik.errors.fileUrl} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Fecha de Vencimiento" name="expiresAt" type="date" value={formik.values.expiresAt}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.expiresAt && Boolean(formik.errors.expiresAt)}
                  helperText={formik.touched.expiresAt && formik.errors.expiresAt}
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
