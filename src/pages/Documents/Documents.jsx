import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem, Autocomplete, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getAllDocuments, uploadDocument, updateDocumentStatus } from '../../api/hrDocuments';
import { getAllEmployees } from '../../api/employees';

const documentTypes = ['Contract', 'ID', 'Payroll', 'Tax', 'Medical', 'Other'];
const statusColors = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

const initialForm = { employeeId: '', name: '', type: '', fileUrl: '', expiresAt: '' };

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async () => {
    try {
      await uploadDocument({ ...form, employeeId: selectedEmployee?.id || form.employeeId });
      setDialogOpen(false);
      setForm(initialForm);
      setSelectedEmployee(null);
      load();
    } catch {
      // error
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateDocumentStatus(id, { status });
      load();
    } catch {
      // error
    }
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
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por empleado o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <TableCell>Empleado</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Subido</TableCell>
                <TableCell>Acciones</TableCell>
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
                    <TableCell>
                      <Chip label={doc.status} size="small" color={statusColors[doc.status] || 'default'} />
                    </TableCell>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={employees}
              getOptionLabel={(opt) => `${opt.fullName} (${opt.code})`}
              value={selectedEmployee}
              onChange={(_, v) => setSelectedEmployee(v)}
              renderInput={(params) => <TextField {...params} label="Empleado" fullWidth required />}
            />
            <TextField label="Nombre del Documento" name="name" value={form.name} onChange={handleFormChange} fullWidth required />
            <TextField label="Tipo" name="type" value={form.type} onChange={handleFormChange} fullWidth select required>
              {documentTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="URL del Archivo" name="fileUrl" value={form.fileUrl} onChange={handleFormChange} fullWidth />
            <TextField label="Fecha de Vencimiento" name="expiresAt" type="date" value={form.expiresAt} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload}>Subir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
