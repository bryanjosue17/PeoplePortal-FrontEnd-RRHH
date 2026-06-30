import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem, Grid, Stack
} from '@mui/material';
import { getAllRequests, updateRequestStatus } from '../../api/hrRequests';
import { getAllEmployees } from '../../api/employees';

const statusColors = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

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
      setDetailOpen(false);
      setSelectedRequest(null);
      load();
    } catch {
      // error
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
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
                    <Chip label={req.status} size="small" color={statusColors[req.status] || 'default'} />
                  </TableCell>
                  <TableCell>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {req.status === 'Pending' && (
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
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Empleado</Typography><Typography>{getEmployeeName(selectedRequest.employeeId)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Tipo</Typography><Typography>{selectedRequest.type}</Typography></Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Typography><Chip label={selectedRequest.status} size="small" color={statusColors[selectedRequest.status] || 'default'} /></Typography>
              </Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Creado</Typography><Typography>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : '-'}</Typography></Grid>
              {selectedRequest.description && (
                <Grid item xs={12}><Typography variant="caption" color="text.secondary">Descripción</Typography><Typography>{selectedRequest.description}</Typography></Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedRequest?.status === 'Pending' && (
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
