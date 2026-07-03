import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
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
import { createNomina, getAllNomina, uploadNominaFile } from '../../api/nomina';

const NOMINA_TYPES = [
  { label: 'Comprobante de Pago',   value: 'ComprobanteDepago' },
  { label: 'Bonificación',          value: 'Bonificacion' },
  { label: 'Adelanto de Salario',   value: 'Adelanto' },
  { label: 'Aguinaldo',             value: 'Aguinaldo' },
  { label: 'Vacaciones',            value: 'Vacaciones' },
  { label: 'Otro',                  value: 'Otro' },
];
const NOMINA_TYPE_LABELS = Object.fromEntries(NOMINA_TYPES.map(t => [t.value, t.label]));

const STATUS_COLORS  = { AvailableForDownload: 'success', Completed: 'default', InProcess: 'info', Rejected: 'error', Requested: 'warning' };
const STATUS_LABELS  = { AvailableForDownload: 'Disponible', Completed: 'Completado', InProcess: 'En Proceso', Rejected: 'Rechazado', Requested: 'Solicitado' };

const TYPE_COLORS = {
  ComprobanteDepago: 'primary', Bonificacion: 'success', Adelanto: 'warning',
  Aguinaldo: 'secondary', Vacaciones: 'info', Otro: 'default',
};

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const currentYear = new Date().getFullYear();

export default function Nomina() {
  const [records, setRecords]         = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [selected, setSelected]       = useState(null);
  const [fileUrl, setFileUrl]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create form
  const [createEmp, setCreateEmp]       = useState(null);
  const [createMonth, setCreateMonth]   = useState('');
  const [createYear, setCreateYear]     = useState(String(currentYear));
  const [createType, setCreateType]     = useState('ComprobanteDepago');
  const [createNotes, setCreateNotes]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllNomina(), getAllEmployees()])
      .then(([nRes, eRes]) => {
        setRecords(Array.isArray(nRes.data) ? nRes.data : []);
        setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
      })
      .catch(() => { setRecords([]); setEmployees([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId || e.keycloakId === empId);
    return emp ? `${emp.fullName} (${emp.code})` : empId;
  };

  const filtered = records.filter(v => {
    const matchStatus = filterStatus ? v.status === filterStatus : true;
    const matchType   = filterType   ? v.nominaType === filterType : true;
    const matchPeriod = filterPeriod ? (v.period || '').toLowerCase().includes(filterPeriod.toLowerCase()) : true;
    return matchStatus && matchType && matchPeriod;
  });
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Counters
  const pending   = records.filter(r => r.status === 'Requested').length;
  const available = records.filter(r => r.status === 'AvailableForDownload').length;

  const handleCreate = async () => {
    if (!createEmp || !createMonth || !createYear) { toast.error('Completa empleado, mes y año'); return; }
    setSubmitting(true);
    try {
      await createNomina({
        employeeId: createEmp.keycloakId || createEmp.id,
        period:     `${createMonth} ${createYear}`,
        nominaType: createType,
        notes:      createNotes || undefined,
      });
      toast.success('Registro de nómina creado');
      setCreateOpen(false);
      setCreateEmp(null); setCreateMonth(''); setCreateYear(String(currentYear));
      setCreateType('ComprobanteDepago'); setCreateNotes('');
      load();
    } catch { toast.error('Error al crear registro'); }
    finally { setSubmitting(false); }
  };

  const handleUpload = async () => {
    if (!fileUrl.trim()) { toast.error('Ingresa la URL del archivo'); return; }
    setSubmitting(true);
    try {
      await uploadNominaFile(selected.id, { fileUrl });
      toast.success('Archivo subido exitosamente');
      setUploadOpen(false); setSelected(null); setFileUrl(''); load();
    } catch { toast.error('Error al subir archivo'); }
    finally { setSubmitting(false); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: { sm: 0, xs: 1 }, justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
          <Box sx={{ alignItems: 'center', bgcolor: alpha('#34D399', 0.12), borderRadius: 2, color: 'primary.main', display: 'flex', p: 1 }}>
            <MonetizationOnIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>Nómina</Typography>
            <Typography variant="body2" color="text.secondary">Gestión de comprobantes y pagos de nómina</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ width: { sm: 'auto', xs: '100%' } }}>
          Nuevo Registro
        </Button>
      </Box>

      {/* KPI pills */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total registros', value: records.length, color: 'primary' },
          { label: 'Pendientes de archivo', value: pending, color: 'warning' },
          { label: 'Disponibles para descarga', value: available, color: 'success' },
        ].map(k => (
          <Grid size={{ md: 4, xs: 12 }} key={k.label}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h4" fontWeight={700} color={`${k.color}.main`}>{k.value}</Typography>
              <Typography variant="body2" color="text.secondary">{k.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pending > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{pending}</strong> registro{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''} de archivo adjunto.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField size="small" fullWidth label="Buscar período" value={filterPeriod}
              onChange={e => { setFilterPeriod(e.target.value); setPage(0); }}
              placeholder="Ej: Enero 2026" />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField select size="small" fullWidth label="Tipo" value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(0); }}>
              <MenuItem value="">Todos los tipos</MenuItem>
              {NOMINA_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <TextField select size="small" fullWidth label="Estado" value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">Todos los estados</MenuItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
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
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map(v => (
                  <TableRow key={v.id} hover>
                    <TableCell>{getEmployeeName(v.employeeId)}</TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{v.period}</Typography></TableCell>
                    <TableCell>
                      <Chip label={NOMINA_TYPE_LABELS[v.nominaType] ?? v.nominaType}
                        size="small" color={TYPE_COLORS[v.nominaType] ?? 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[v.status] ?? v.status}
                        size="small" color={STATUS_COLORS[v.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{v.notes || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {v.requestedAt ? new Date(v.requestedAt).toLocaleDateString('es-GT') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {v.status === 'Requested' && (
                        <Button size="small" variant="outlined" startIcon={<UploadFileIcon />}
                          onClick={() => { setSelected(v); setFileUrl(''); setUploadOpen(true); }}>
                          Subir
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
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 4 }}>
                        <MonetizationOnIcon sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
                        <Typography color="text.secondary">No se encontraron registros de nómina.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filtered.length} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Por página:" />
        </>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Registro de Nómina</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Autocomplete options={employees} getOptionLabel={opt => `${opt.fullName} (${opt.code})`}
                value={createEmp} onChange={(_, v) => setCreateEmp(v)}
                renderInput={params => <TextField {...params} label="Empleado" required />} />
            </Grid>
            <Grid size={12}>
              <TextField select fullWidth label="Tipo de registro" value={createType}
                onChange={e => setCreateType(e.target.value)} required>
                {NOMINA_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField select fullWidth label="Mes" value={createMonth}
                onChange={e => setCreateMonth(e.target.value)} required>
                {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <TextField fullWidth label="Año" type="number" value={createYear}
                onChange={e => setCreateYear(e.target.value)} required
                slotProps={{ htmlInput: { min: 2020, max: currentYear + 1 } }} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Notas (opcional)" multiline rows={2}
                value={createNotes} onChange={e => setCreateNotes(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear Registro'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Archivo — {selected && NOMINA_TYPE_LABELS[selected.nominaType]}</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Empleado: <strong>{getEmployeeName(selected.employeeId)}</strong> · Período: <strong>{selected.period}</strong>
              </Typography>
            </Box>
          )}
          <TextField fullWidth label="URL del archivo" value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="https://storage.example.com/nomina-enero-2026.pdf" required />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setUploadOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleUpload} disabled={submitting}>
            {submitting ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
