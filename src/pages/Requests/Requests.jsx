import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem, Grid, Stack
} from '@mui/material';
import { toast } from 'react-toastify';
import { getAllRequests, updateRequestStatus } from '../../api/hrRequests';
import { getAllEmployees } from '../../api/employees';

const statusColors = { Submitted: 'info', InReview: 'warning', Approved: 'success', Rejected: 'error', Cancelled: 'default' };
const statusLabels = { Submitted: 'Enviado', InReview: 'En Revisión', Approved: 'Aprobado', Rejected: 'Rechazado', Cancelled: 'Cancelado' };

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllRequests(), getAllEmployees()])
      .then(([reqRes, empRes]) => {
        setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      })
      .catch(() => { setRequests([]); setEmployees([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const types = [...new Set(requests.map((r) => r.type).filter(Boolean))];

  const filtered = requests.filter((r) => {
    const matchType = typeFilter ? r.type === typeFilter : true;
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    return matchType && matchStatus;
  });

  const handleDetail = (req) => {
    setSelectedRequest(req);
    setDetailOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(id, { status });
      toast.success(`Solicitud ${status === 'Approved' ? 'aprobada' : 'rechazada'} exitosamente`);
      setDetailOpen(false);
      setSelectedRequest(null);
      load();
    } catch {
      toast.error('Error al actualizar solicitud');
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId || e.keycloakId === empId);
    return emp?.fullName || empId;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Solicitudes</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField select label="Tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <MenuItem value="">Todos</MenuItem>
          {types.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField select label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="Submitted">Enviado</MenuItem>
          <MenuItem value="InReview">En Revisión</MenuItem>
          <MenuItem value="Approved">Aprobado</MenuItem>
          <MenuItem value="Rejected">Rechazado</MenuItem>
          <MenuItem value="Cancelled">Cancelado</MenuItem>
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
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleDetail(req)}>
                  <TableCell>{getEmployeeName(req.employeeId)}</TableCell>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>
                    <Chip label={statusLabels[req.status] ?? req.status} size="small" color={statusColors[req.status] || 'default'} />
                  </TableCell>
                  <TableCell>{req.createdAtUtc ? new Date(req.createdAtUtc).toLocaleDateString('es-GT') : '-'}</TableCell>
                  <TableCell>
                    {(req.status === 'Submitted' || req.status === 'InReview') && (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} onClick={(e) => e.stopPropagation()}>
                        <Button size="small" color="success" variant="outlined" onClick={() => handleStatusChange(req.id, 'Approved')}>Aprobar</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleStatusChange(req.id, 'Rejected')}>Rechazar</Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No se encontraron solicitudes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de Solicitud</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Empleado</Typography><Typography>{getEmployeeName(selectedRequest.employeeId)}</Typography></Grid>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Tipo</Typography><Typography>{selectedRequest.type}</Typography></Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Typography><Chip label={statusLabels[selectedRequest.status] ?? selectedRequest.status} size="small" color={statusColors[selectedRequest.status] || 'default'} /></Typography>
              </Grid>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Creado</Typography><Typography>{selectedRequest.createdAtUtc ? new Date(selectedRequest.createdAtUtc).toLocaleDateString('es-GT') : '-'}</Typography></Grid>
              {selectedRequest.description && (
                <Grid size={12}><Typography variant="caption" color="text.secondary">Descripción</Typography><Typography>{selectedRequest.description}</Typography></Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
          {(selectedRequest?.status === 'Submitted' || selectedRequest?.status === 'InReview') && (
            <>
              <Button color="error" variant="contained" onClick={() => handleStatusChange(selectedRequest.id, 'Rejected')}>Rechazar</Button>
              <Button color="success" variant="contained" onClick={() => handleStatusChange(selectedRequest.id, 'Approved')}>Aprobar</Button>
            </>
          )}
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
