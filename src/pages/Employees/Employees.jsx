import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getAllEmployees, createEmployee } from '../../api/employees';

const contractTypes = ['Indefinido', 'Temporal', 'Prácticas', 'Freelance'];
const statusOptions = ['Active', 'Inactive', 'Suspended'];

const initialForm = {
  keycloakId: '', code: '', fullName: '', email: '', phone: '',
  department: '', position: '', hireDate: '', contractType: '',
  emergencyContact: '', site: '', managerId: ''
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAllEmployees()
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter((e) =>
    (e.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.department?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (e.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await createEmployee(form);
      setDialogOpen(false);
      setForm(initialForm);
      load();
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="h4">Empleados</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Añadir Empleado
        </Button>
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nombre, departamento o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow
                  key={emp.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <TableCell>{emp.code}</TableCell>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.status}
                      size="small"
                      color={emp.status === 'Active' ? 'success' : emp.status === 'Suspended' ? 'warning' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No se encontraron empleados</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Añadir Empleado</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Keycloak ID" name="keycloakId" value={form.keycloakId} onChange={handleChange} fullWidth />
            <TextField label="Código" name="code" value={form.code} onChange={handleChange} fullWidth required />
            <TextField label="Nombre Completo" name="fullName" value={form.fullName} onChange={handleChange} fullWidth required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required />
            <TextField label="Teléfono" name="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="Departamento" name="department" value={form.department} onChange={handleChange} fullWidth />
            <TextField label="Cargo" name="position" value={form.position} onChange={handleChange} fullWidth />
            <TextField label="Fecha de Contratación" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Tipo de Contrato" name="contractType" value={form.contractType} onChange={handleChange} fullWidth select>
              {contractTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Contacto de Emergencia" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} fullWidth />
            <TextField label="Sitio" name="site" value={form.site} onChange={handleChange} fullWidth />
            <TextField label="Manager ID" name="managerId" value={form.managerId} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
