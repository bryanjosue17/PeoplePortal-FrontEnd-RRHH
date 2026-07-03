import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid,
  InputAdornment, Paper, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createUser, getRealmRoles, getUsers,
  resetPassword, setUserEnabled, setUserRoles,
} from '../../api/userManagement';

const SYSTEM_ROLES = ['default-roles-peopleportal', 'offline_access', 'uma_authorization'];
const ROLE_COLORS = {
  employee: 'primary', jefe_inmediato: 'warning', hr: 'success',
  nomina: 'info', admin: 'error',
};

export default function UserManagement() {
  const [users, setUsers]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm]             = useState({ username:'', email:'', firstName:'', lastName:'', tempPassword:'', enabled: true });
  const [submitting, setSubmitting] = useState(false);

  // Edit roles dialog
  const [rolesOpen, setRolesOpen]   = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Reset password dialog
  const [pwOpen, setPwOpen]         = useState(false);
  const [pwUser, setPwUser]         = useState(null);
  const [newPw, setNewPw]           = useState('');
  const [temporary, setTemporary]   = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getUsers(), getRealmRoles()])
      .then(([uRes, rRes]) => {
        setUsers(Array.isArray(uRes.data) ? uRes.data : []);
        setRoles((Array.isArray(rRes.data) ? rRes.data : []).filter(r => !SYSTEM_ROLES.includes(r.name)));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email    || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName|| '').toLowerCase().includes(search.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.employeeFullName || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleToggleEnabled = async (u) => {
    try {
      await setUserEnabled(u.keycloakId, !u.enabled);
      toast.success(`Usuario ${!u.enabled ? 'habilitado' : 'deshabilitado'}`);
      load();
    } catch { toast.error('Error al cambiar estado del usuario'); }
  };

  const handleCreateUser = async () => {
    if (!form.username || !form.email || !form.tempPassword) {
      toast.error('Username, email y contraseña son requeridos'); return;
    }
    setSubmitting(true);
    try {
      await createUser(form);
      toast.success('Usuario creado en Keycloak');
      setCreateOpen(false);
      setForm({ username:'', email:'', firstName:'', lastName:'', tempPassword:'', enabled:true });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    } finally { setSubmitting(false); }
  };

  const openRolesDialog = (u) => {
    setEditUser(u);
    setSelectedRoles(u.roles || []);
    setRolesOpen(true);
  };

  const handleSaveRoles = async () => {
    try {
      await setUserRoles(editUser.keycloakId, selectedRoles);
      toast.success('Roles actualizados');
      setRolesOpen(false);
      load();
    } catch { toast.error('Error al actualizar roles'); }
  };

  const handleResetPw = async () => {
    if (!newPw) { toast.error('Ingresa la nueva contraseña'); return; }
    try {
      await resetPassword(pwUser.keycloakId, { newPassword: newPw, temporary });
      toast.success('Contraseña restablecida');
      setPwOpen(false); setNewPw('');
    } catch { toast.error('Error al restablecer contraseña'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  const activeCount   = users.filter(u => u.enabled).length;
  const inactiveCount = users.length - activeCount;
  const linkedCount   = users.filter(u => u.employeeId).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
          <Box sx={{ alignItems: 'center', bgcolor: alpha('#34D399', 0.12), borderRadius: 2, color: 'primary.main', display: 'flex', p: 1 }}>
            <ManageAccountsIcon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>Gestión de Usuarios</Typography>
            <Typography variant="body2" color="text.secondary">Usuarios de Keycloak vinculados a empleados</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Nuevo Usuario
        </Button>
      </Box>

      {/* KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total usuarios', value: users.length, color: 'primary' },
          { label: 'Habilitados', value: activeCount, color: 'success' },
          { label: 'Deshabilitados', value: inactiveCount, color: 'error' },
          { label: 'Vinculados a empleado', value: linkedCount, color: 'warning' },
        ].map(k => (
          <Grid size={{ md: 3, sm: 6, xs: 12 }} key={k.label}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h4" fontWeight={700} color={`${k.color}.main`}>{k.value}</Typography>
              <Typography variant="body2" color="text.secondary">{k.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por usuario, email, nombre o empleado..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment> } }} />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Empleado vinculado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(u => (
              <TableRow key={u.keycloakId} hover>
                <TableCell>
                  <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: u.enabled ? 'primary.main' : 'action.disabled', fontSize: 14, height: 32, width: 32 }}>
                      {(u.firstName?.charAt(0) || u.username?.charAt(0) || '?').toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</Typography>
                </TableCell>
                <TableCell>
                  {u.employeeId ? (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.employeeFullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.department} · {u.position}</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={u.employeeStatus} size="small"
                          color={u.employeeStatus === 'Active' ? 'success' : 'default'} />
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.disabled" fontStyle="italic">Sin empleado vinculado</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {(u.roles || []).length === 0
                      ? <Typography variant="caption" color="text.disabled">Sin roles</Typography>
                      : (u.roles || []).map(r => (
                          <Chip key={r} label={r} size="small"
                            color={ROLE_COLORS[r] ?? 'default'} variant="outlined" />
                        ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={u.enabled ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <PersonOffIcon sx={{ fontSize: 14 }} />}
                    label={u.enabled ? 'Habilitado' : 'Deshabilitado'}
                    color={u.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Editar roles">
                      <Button size="small" variant="outlined" startIcon={<EditIcon />}
                        onClick={() => openRolesDialog(u)}>
                        Roles
                      </Button>
                    </Tooltip>
                    <Tooltip title="Restablecer contraseña">
                      <Button size="small" variant="outlined" color="warning" startIcon={<LockResetIcon />}
                        onClick={() => { setPwUser(u); setNewPw(''); setPwOpen(true); }}>
                        Contraseña
                      </Button>
                    </Tooltip>
                    <Tooltip title={u.enabled ? 'Deshabilitar usuario' : 'Habilitar usuario'}>
                      <Button size="small" variant="outlined"
                        color={u.enabled ? 'error' : 'success'}
                        onClick={() => handleToggleEnabled(u)}>
                        {u.enabled ? 'Deshabilitar' : 'Habilitar'}
                      </Button>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4 }}>
                    <ManageAccountsIcon sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
                    <Typography color="text.secondary">No se encontraron usuarios.</Typography>
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

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Usuario en Keycloak</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { field: 'username',      label: 'Username *' },
              { field: 'email',         label: 'Email *' },
              { field: 'firstName',     label: 'Nombre' },
              { field: 'lastName',      label: 'Apellido' },
              { field: 'tempPassword',  label: 'Contraseña temporal *', type: 'password' },
            ].map(({ field, label, type }) => (
              <Grid size={{ sm: field === 'username' || field === 'email' || field === 'tempPassword' ? 12 : 6, xs: 12 }} key={field}>
                <TextField fullWidth size="small" label={label} type={type || 'text'}
                  value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </Grid>
            ))}
            <Grid size={12}>
              <FormControlLabel
                control={<Switch checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} />}
                label="Habilitado al crear"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Roles Dialog */}
      <Dialog open={rolesOpen} onClose={() => setRolesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Roles de {editUser?.username}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona los roles del realm <strong>peopleportal</strong> para este usuario.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {roles.map(r => {
              const active = selectedRoles.includes(r.name);
              return (
                <Chip key={r.id} label={r.name}
                  color={active ? (ROLE_COLORS[r.name] ?? 'primary') : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => setSelectedRoles(prev =>
                    prev.includes(r.name) ? prev.filter(x => x !== r.name) : [...prev, r.name]
                  )}
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setRolesOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveRoles}>Guardar Roles</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Restablecer Contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Usuario: <strong>{pwUser?.username}</strong>
          </Typography>
          <TextField fullWidth label="Nueva contraseña" type="password" value={newPw}
            onChange={e => setNewPw(e.target.value)} sx={{ mb: 2 }} />
          <FormControlLabel
            control={<Switch checked={temporary} onChange={e => setTemporary(e.target.checked)} />}
            label="Contraseña temporal (el usuario debe cambiarla al iniciar sesión)"
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setPwOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="warning" startIcon={<LockResetIcon />} onClick={handleResetPw}>
            Restablecer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
