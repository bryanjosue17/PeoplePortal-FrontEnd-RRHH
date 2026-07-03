import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert, Autocomplete, Box, Button, Card, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllEmployees } from '../../api/employees';
import { createVoucherFor, getAllVouchers, uploadVoucherFile } from '../../api/hrVouchers';

const statusColors  = { AvailableForDownload: 'success', Completed: 'default', Rejected: 'error', Requested: 'warning' };
const statusLabels  = { AvailableForDownload: 'Disponible', Completed: 'Completado', Rejected: 'Rechazado', Requested: 'Solicitado' };

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const currentYear = new Date().getFullYear();

export default function Vouchers() {
  const [vouchers, setVouchers]       = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [selected, setSelected]       = useState(null);
  const [fileUrl, setFileUrl]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create form state
  const [createEmp, setCreateEmp]     = useState(null);
  const [createMonth, setCreateMonth] = useState('');
  const [createYear, setCreateYear]   = useState(String(currentYear));
  const [createReason, setCreateReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllVouchers(), getAllEmployees()])
      .then(([vRes, eRes]) => {
        setVouchers(Array.isArray(vRes.data) ? vRes.data : []);
        setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
      })
      .catch(() => { setVouchers([]); setEmployees([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId || e.keycloakId === empId);
    return emp?.fullName ?? empId;
  };

  const filtered = vouchers.filter(v => {
    const matchStatus = filterStatus ? v.status === filterStatus : true;
    const matchPeriod = filterPeriod ? (v.period || '').toLowerCase().includes(filterPeriod.toLowerCase()) : true;
    return matchStatus && matchPeriod;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleCreate = async () => {
    if (!createEmp || !createMonth || !createYear) {
      toast.error('Completa empleado, mes y año');
      return;
    }
    setSubmitting(true);
    try {
      await createVoucherFor({
        employeeId: createEmp.keycloakId || createEmp.id,
        period: `${createMonth} ${createYear}`,
        reason: createReason || undefined,
      });
      toast.success('Voucher creado exitosamente');
      setCreateOpen(false);
      setCreateEmp(null); setCreateMonth(''); setCreateYear(String(currentYear)); setCreateReason('');
      load();
    } catch {
      toast.error('Error al crear voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!fileUrl.trim()) { toast.error('Ingresa la URL del archivo'); return; }
    setSubmitting(true);
    try {
      await uploadVoucherFile(selected.id, { fileUrl });
      toast.success('Archivo subido exitosamente');
      setUploadOpen(false); setSelected(null); setFileUrl('');
      load();
    } catch {
      toast.error('Error al subir archivo');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = vouchers.filter(v => v.status === 'Requested').length;

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
          <Box sx={{ alignItems: 'center', bgcolor: alpha('#34D399', 0.12), borderRadius: 2, color: 'primary.main', display: 'flex', p: 1 }}>
            <ReceiptLongIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>Vouchers de Pago</Typography>
            <Typography variant="body2" color="text.secondary">Gestión de comprobantes de pago por empleado</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ width: { sm: 'auto', xs: '100%' } }}>
          Nuevo Voucher
        </Button>
      </Box>

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Hay <strong>{pendingCount}</strong> voucher{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de archivo.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2 }}>
          <TextField
            size="small" label="Buscar período" value={filterPeriod}
            onChange={e => { setFilterPeriod(e.target.value); setPage(0); }}
            placeholder="Ej: Enero 2026"
            sx={{ minWidth: 200 }}
          />
          <TextField select size="small" label="Estado" value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}>
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="Requested">Solicitado</MenuItem>
            <MenuItem value="AvailableForDownload">Disponible</MenuItem>
            <MenuItem value="Completed">Completado</MenuItem>
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
                  <TableCell sx={{ fontWeight: 600 }}>Período</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motivo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map(v => (
                  <TableRow key={v.id} hover>
                    <TableCell>{getEmployeeName(v.employeeId)}</TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{v.period}</Typography></TableCell>
                    <TableCell><Chip label={statusLabels[v.status] ?? v.status} size="small" color={statusColors[v.status] || 'default'} /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{v.reason || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{v.requestedAt ? new Date(v.requestedAt).toLocaleDateString('es-GT') : '—'}</Typography></TableCell>
                    <TableCell>
                      {(v.status === 'Requested') && (
                        <Button size="small" variant="outlined" color="primary" startIcon={<UploadFileIcon />}
                          onClick={() => { setSelected(v); setFileUrl(''); setUploadOpen(true); }}>
                          Subir archivo
                        </Button>
                      )}
                      {v.fileUrl && (
                        <Button size="small" variant="text" href={v.fileUrl} target="_blank" rel="noopener noreferrer">
                          Ver archivo
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4 }}>
                      <ReceiptLongIcon sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
                      <Typography color="text.secondary">No se encontraron vouchers.</Typography>
                    </Box>
                  </TableCell></TableRow>
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
          />
        </>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Voucher de Pago</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Autocomplete
                options={employees}
                getOptionLabel={opt => `${opt.fullName} (${opt.code})`}
                value={createEmp}
                onChange={(_, v) => setCreateEmp(v)}
                renderInput={params => <TextField {...params} label="Empleado" required />}
              />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField select fullWidth label="Mes" value={createMonth} onChange={e => setCreateMonth(e.target.value)} required>
                {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField fullWidth label="Año" type="number" value={createYear}
                onChange={e => setCreateYear(e.target.value)} required
                slotProps={{ htmlInput: { min: 2020, max: currentYear + 1 } }} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Motivo (opcional)" multiline rows={2}
                value={createReason} onChange={e => setCreateReason(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear Voucher'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Archivo de Voucher</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Empleado: <strong>{getEmployeeName(selected.employeeId)}</strong> — Período: <strong>{selected.period}</strong>
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth label="URL del archivo (PDF/imagen)" value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="https://storage.example.com/voucher-2026-01.pdf"
            required
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setUploadOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload} disabled={submitting} startIcon={<UploadFileIcon />}>
            {submitting ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
