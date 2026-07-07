import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, InputAdornment, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { getAllEmployees } from '../../api/employees';
import { getAllDocuments, updateDocumentStatus, uploadDocument } from '../../api/hrDocuments';

const documentTypes = ['Contract', 'ID', 'Payroll', 'Tax', 'Medical', 'Other'];
const statusColors = { Approved: 'success', Available: 'info', Expired: 'default', InReview: 'warning', Pending: 'warning', Rejected: 'error' };
const statusLabels = { Approved: 'Aprobado', Available: 'Disponible', Expired: 'Expirado', InReview: 'En Revisión', Pending: 'Pendiente', Rejected: 'Rechazado' };

const validationSchema = yup.object({
  expiresAt: yup.string(),
  fileUrl: yup.string(),
  name: yup.string().required('Requerido'),
  type: yup.string().required('Requerido'),
});

export default function Documents() {
  const [documents, setDocuments]     = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formik = useFormik({
    initialValues: { expiresAt: '', fileUrl: '', name: '', type: '' },
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
    validationSchema,
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
    const emp = employees.find((e) => e.id === d.employeeId || e.keycloakId === d.employeeId);
    const empName = emp?.fullName || '';
    const matchSearch = empName.toLowerCase().includes(search.toLowerCase()) ||
      (d.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? d.status === statusFilter : true;
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Documentos</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { sm: 'auto', xs: '100%' } }}>
          Subir Documento
        </Button>
      </Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2 }}>
          <TextField fullWidth variant="outlined" placeholder="Buscar por empleado o nombre..."
            value={search} onChange={(e) => setSearch(e.target.value)} size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment> } }}
          />
          <TextField select label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { sm: 160, xs: '100%' } }} size="small">
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="Pending">Pendiente</MenuItem>
            <MenuItem value="Approved">Aprobado</MenuItem>
            <MenuItem value="Rejected">Rechazado</MenuItem>
          </TextField>
        </Box>
      </Paper>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subido</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((doc) => {
                const emp = employees.find((e) => e.id === doc.employeeId || e.keycloakId === doc.employeeId);
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{emp?.fullName ?? <Typography component="span" variant="body2" color="text.disabled" fontStyle="italic">Empleado no encontrado</Typography>}</TableCell>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell><Chip label={statusLabels[doc.status] ?? doc.status} size="small" color={statusColors[doc.status] || 'default'} /></TableCell>
                    <TableCell>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {doc.status === 'Pending' && (
                        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={0.5}>
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
          <DialogActions sx={{ justifyContent: 'flex-start', pb: 2, px: 3 }}>
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
