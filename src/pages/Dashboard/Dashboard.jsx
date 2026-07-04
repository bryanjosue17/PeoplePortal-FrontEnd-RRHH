import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Box, Button, Card, CardContent, CircularProgress, Grid, Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, Tooltip,
} from 'chart.js';
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { getActiveAnnouncements } from '../../api/announcements';
import { getAllEmployees } from '../../api/employees';
import { getAllDocuments } from '../../api/hrDocuments';
import { getAllRequests } from '../../api/hrRequests';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const chartText  = isDark ? '#E2E8F0' : '#1E293B';
  const chartMuted = isDark ? '#94A3B8' : '#64748B';
  const chartGrid  = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.07)';

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawReqs, setRawReqs] = useState([]);
  const [rawEmps, setRawEmps] = useState([]);

  useEffect(() => {
    Promise.all([
      getAllEmployees(),
      getAllRequests(),
      getAllDocuments(),
      getActiveAnnouncements()
    ])
      .then(([empRes, reqRes, docRes, annRes]) => {
        const employees = Array.isArray(empRes.data) ? empRes.data : [];
        const requests  = Array.isArray(reqRes.data) ? reqRes.data  : [];
        const totalEmployees    = employees.length;
        const pendingRequests   = requests.filter(r => r.status === 'Submitted' || r.status === 'InReview').length;
        const activeDocuments   = Array.isArray(docRes.data) ? docRes.data.length : 0;
        const recentAnnouncements = Array.isArray(annRes.data) ? annRes.data.length : 0;
        setData({ activeDocuments, pendingRequests, recentAnnouncements, totalEmployees });
        setRawReqs(requests);
        setRawEmps(employees);
      })
      .catch(() => setData({ activeDocuments: 0, pendingRequests: 0, recentAnnouncements: 0, totalEmployees: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  const summaryCards = [
    { color: '#2e7d32', icon: <PeopleIcon sx={{ fontSize: 28 }} />, label: 'Total Empleados', value: data?.totalEmployees ?? 0 },
    { color: '#ed6c02', icon: <AssignmentIcon sx={{ fontSize: 28 }} />, label: 'Solicitudes Activas', value: data?.pendingRequests ?? 0 },
    { color: '#1565c0', icon: <DescriptionIcon sx={{ fontSize: 28 }} />, label: 'Documentos Activos', value: data?.activeDocuments ?? 0 },
    { color: '#9c27b0', icon: <CampaignIcon sx={{ fontSize: 28 }} />, label: 'Comunicados Recientes', value: data?.recentAnnouncements ?? 0 },
  ];

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mb: 4 }}>
        <SpeedIcon color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Bienvenido, {keycloak?.tokenParsed?.given_name || keycloak?.tokenParsed?.preferred_username || 'Usuario'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panel de administración de Recursos Humanos
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid size={{ md: 3, sm: 6, xs: 12 }} key={card.label}>
            <Card sx={{
              borderLeft: `3px solid ${card.color}`,
              height: '100%',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}>
              <CardContent>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
                  <Box sx={{
                    alignItems: 'center',
                    bgcolor: alpha(card.color, 0.12),
                    borderRadius: 2,
                    color: card.color,
                    display: 'flex',
                    justifyContent: 'center',
                    p: 1.5,
                  }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Acciones Rápidas</Typography>
      <Grid container spacing={2}>
        <Grid size={{ sm: 3, xs: 6 }}>
          <Button variant="contained" fullWidth sx={{ py: 2 }} onClick={() => navigate('/employees')}>
            Gestionar Empleados
          </Button>
        </Grid>
        <Grid size={{ sm: 3, xs: 6 }}>
          <Button variant="contained" color="secondary" fullWidth sx={{ py: 2 }} onClick={() => navigate('/documents')}>
            Revisar Documentos
          </Button>
        </Grid>
        <Grid size={{ sm: 3, xs: 6 }}>
          <Button variant="contained" color="warning" fullWidth sx={{ py: 2 }} onClick={() => navigate('/requests')}>
            Solicitudes
          </Button>
        </Grid>
        <Grid size={{ sm: 3, xs: 6 }}>
          <Button variant="contained" color="secondary" fullWidth sx={{ py: 2 }} onClick={() => navigate('/announcements')}>
            Nuevo Comunicado
          </Button>
        </Grid>
      </Grid>

      {/* ── Charts section ── */}
      {(rawReqs.length > 0 || rawEmps.length > 0) && (
        <>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 4 }}>Análisis Rápido</Typography>
          <Grid container spacing={3}>

            {/* Doughnut: solicitudes por estado */}
            {rawReqs.length > 0 && (() => {
              const counts = {};
              rawReqs.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
              const STATUS_LABELS = { Submitted: 'Enviado', InReview: 'En Revisión', Approved: 'Aprobado', Rejected: 'Rechazado', Cancelled: 'Cancelado' };
              const STATUS_COLORS_D = { Submitted: '#60A5FA', InReview: '#F59E0B', Approved: '#34D399', Rejected: '#F87171', Cancelled: '#94A3B8' };
              const labels = Object.keys(counts);
              const chartData = {
                labels: labels.map(k => STATUS_LABELS[k] ?? k),
                datasets: [{ data: labels.map(k => counts[k]), backgroundColor: labels.map(k => STATUS_COLORS_D[k] ?? '#94A3B8'), borderWidth: 0, hoverOffset: 6 }],
              };
              return (
                <Grid size={{ md: 4, xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Solicitudes por Estado</Typography>
                      <Box sx={{ height: 220 }}>
                        <Doughnut data={chartData} options={{
                          responsive: true, maintainAspectRatio: false, cutout: '65%',
                          plugins: {
                            legend: { position: 'right', labels: { color: chartText, font: { size: 11 }, boxWidth: 12 } },
                            tooltip: { titleColor: chartText, bodyColor: chartMuted },
                          },
                        }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })()}

            {/* Bar: empleados por departamento */}
            {rawEmps.length > 0 && (() => {
              const depts = {};
              rawEmps.forEach(e => { if (e.department) depts[e.department] = (depts[e.department] || 0) + 1; });
              const sorted = Object.entries(depts).sort((a, b) => b[1] - a[1]).slice(0, 7);
              const DEPT_COLORS = ['#34D399','#60A5FA','#F59E0B','#A78BFA','#FB923C','#F87171','#94A3B8'];
              const chartData = {
                labels: sorted.map(([dept]) => dept),
                datasets: [{ label: 'Empleados', data: sorted.map(([, count]) => count), backgroundColor: DEPT_COLORS, borderRadius: 6, borderWidth: 0 }],
              };
              return (
                <Grid size={{ md: 8, xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Empleados por Departamento</Typography>
                      <Box sx={{ height: 220 }}>
                        <Bar data={chartData} options={{
                          responsive: true, maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: { titleColor: chartText, bodyColor: chartMuted },
                          },
                          scales: {
                            x: { ticks: { color: chartMuted }, grid: { color: chartGrid } },
                            y: { ticks: { color: chartMuted }, grid: { color: chartGrid }, beginAtZero: true },
                          },
                        }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })()}

          </Grid>
        </>
      )}
    </Box>
  );
}
