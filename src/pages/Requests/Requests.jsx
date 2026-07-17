import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllEmployees } from '../../api/employees';
import { getAllRequests, updateRequestStatus } from '../../api/hrRequests';

const statusColors = { Approved: 'success', Cancelled: 'default', InReview: 'warning', Rejected: 'error', Submitted: 'info' };
const statusLabels = { Approved: 'Aprobado', Cancelled: 'Cancelado', InReview: 'En Revisión', Rejected: 'Rechazado', Submitted: 'Enviado' };
const typeLabels = { Certificate: 'Certificado', DataUpdate: 'Actualización de Datos', Other: 'Otro', Permission: 'Permiso', Vacation: 'Vacaciones', Voucher: 'Adelanto de Sueldo' };

export default function Requests() {
  const [requests, setRequests]     = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hrComment, setHrComment]   = useState('');
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    const matchType   = typeFilter   ? r.type   === typeFilter   : true;
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    return matchType && matchStatus;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDetail = (req) => {
    setSelectedRequest(req);
    setHrComment('');
    setDetailOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(id, { status, hrComment: hrComment || undefined });
      toast.success(`Solicitud ${status === 'Approved' ? 'aprobada' : 'rechazada'} exitosamente`);
      setDetailOpen(false);
      setSelectedRequest(null);
      setHrComment('');
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: 2.5, background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#022C22', display: 'flex', boxShadow: '0 6px 16px rgba(16,185,129,0.3)' }}>
            <AssignmentIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>Solicitudes y Vales</Typography>
            <Typography variant="body2" color="text.secondary">Evaluación, resolución y seguimiento de peticiones de vacaciones y constancias de todo el personal</Typography>
          </Box>
        </Box>
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
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2 }}>
          <TextField select label="Tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: { sm: 160, xs: '100%' } }} size="small">
            <MenuItem value="">Todos los tipos</MenuItem>
            {types.map((t) => <MenuItem key={t} value={t}>{typeLabels[t] ?? t}</MenuItem>)}
          </TextField>
          <TextField select label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { sm: 160, xs: '100%' } }} size="small">
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="Submitted">Enviado</MenuItem>
            <MenuItem value="InReview">En Revisión</MenuItem>
            <MenuItem value="Approved">Aprobado</MenuItem>
            <MenuItem value="Rejected">Rechazado</MenuItem>
            <MenuItem value="Cancelled">Cancelado</MenuItem>
          </TextField>
        </Box>
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
                <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((req) => (
                <TableRow key={req.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleDetail(req)}>
                  <TableCell>{getEmployeeName(req.employeeId)}</TableCell>
                  <TableCell>{typeLabels[req.type] ?? req.type}</TableCell>
                  <TableCell>
                    <Chip label={statusLabels[req.status] ?? req.status} size="small" color={statusColors[req.status] || 'default'} />
                  </TableCell>
                  <TableCell>{req.createdAtUtc ? new Date(req.createdAtUtc).toLocaleDateString('es-GT') : '-'}</TableCell>
                  <TableCell>
                    {(req.status === 'Submitted' || req.status === 'InReview') && (
                      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={0.5} onClick={(e) => e.stopPropagation()}>
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

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de Solicitud</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Empleado</Typography><Typography>{getEmployeeName(selectedRequest.employeeId)}</Typography></Grid>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Tipo</Typography><Typography>{typeLabels[selectedRequest.type] ?? selectedRequest.type}</Typography></Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Typography><Chip label={statusLabels[selectedRequest.status] ?? selectedRequest.status} size="small" color={statusColors[selectedRequest.status] || 'default'} /></Typography>
              </Grid>
              <Grid size={6}><Typography variant="caption" color="text.secondary">Creado</Typography><Typography>{selectedRequest.createdAtUtc ? new Date(selectedRequest.createdAtUtc).toLocaleDateString('es-GT') : '-'}</Typography></Grid>
              {selectedRequest.description && (
                <Grid size={12}><Typography variant="caption" color="text.secondary">Descripción</Typography><Typography>{selectedRequest.description}</Typography></Grid>
              )}
              <Grid size={12}>
                <TextField
                  fullWidth multiline rows={3}
                  label="Comentario para el colaborador (opcional)"
                  value={hrComment}
                  onChange={e => setHrComment(e.target.value)}
                  placeholder="Agrega una observación o comentario..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', pb: 2, px: 3 }}>
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
