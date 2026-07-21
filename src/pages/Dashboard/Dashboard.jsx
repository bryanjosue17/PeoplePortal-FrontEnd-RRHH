import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import {
  Box, Card, CardContent, CircularProgress, Grid, Typography, Paper, Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, Tooltip,
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { getActiveAnnouncements } from '../../api/announcements';
import { getAllEmployees } from '../../api/employees';
import { getAllDocuments } from '../../api/hrDocuments';
import { getAllRequests } from '../../api/hrRequests';
import DiceAvatar from '../../components/DiceAvatar';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
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
    { color: '#10B981', icon: <PeopleIcon sx={{ fontSize: 28 }} />, label: 'Total Empleados',       value: data?.totalEmployees ?? 0,     path: '/employees' },
    { color: '#ed6c02', icon: <AssignmentIcon sx={{ fontSize: 28 }} />, label: 'Solicitudes Activas',  value: data?.pendingRequests ?? 0,    path: '/requests' },
    { color: '#3B82F6', icon: <DescriptionIcon sx={{ fontSize: 28 }} />, label: 'Documentos Activos',   value: data?.activeDocuments ?? 0,    path: '/documents' },
    { color: '#8B5CF6', icon: <CampaignIcon sx={{ fontSize: 28 }} />, label: 'Comunicados Recientes', value: data?.recentAnnouncements ?? 0, path: '/announcements' },
  ];

  const userName = user?.name || user?.preferred_username || 'Administrador';
  const displayEmail = user?.email || 'admin@forza.com';

  return (
    <Box>
      {/* Banner Superior Glassmorphism con Gradiente Dinámico */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(14,165,233,0.12) 100%)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          mb: 4,
          p: { xs: 3, md: 4.5 },
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(16,185,129,0.25)',
          boxShadow: '0 8px 32px rgba(16,185,129,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
            <DiceAvatar seed={displayEmail} size={90} sx={{ border: '3px solid', borderColor: 'background.paper' }} />
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h3" fontWeight={850} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
              ¡Bienvenido al Centro de Mando, {userName}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, maxWidth: 650 }}>
              Control total sobre el capital humano, solicitudes pendientes, documentos organizacionales y métricas corporativas en tiempo real.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip 
                icon={<SecurityIcon sx={{ fontSize: 16 }} />} 
                label="Portal RRHH & Administración" 
                size="small"
                color="success" 
                variant="outlined"
                sx={{ fontWeight: 650, borderRadius: 1.5 }}
              />
              <Chip 
                label="Monitoreo Activo" 
                size="small"
                color="info" 
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            </Box>
          </Box>
        </Box>
        
        {/* Background Decorative Circles */}
        <Box sx={{
          position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(255,255,255,0) 70%)', zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute', right: 140, bottom: -80, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0
        }} />
      </Paper>

      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid size={{ md: 3, sm: 6, xs: 12 }} key={card.label}>
            <Card onClick={() => navigate(card.path)} sx={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: 'divider',
              borderTop: `4px solid ${card.color}`,
              borderRadius: 3,
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px -10px ${alpha(card.color, 0.3)}`,
                borderColor: alpha(card.color, 0.4),
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 2.5 }}>
                  <Box sx={{
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${alpha(card.color, 0.2)}, ${alpha(card.color, 0.05)})`,
                    border: `1px solid ${alpha(card.color, 0.3)}`,
                    borderRadius: 2.5,
                    color: card.color,
                    display: 'flex',
                    justifyContent: 'center',
                    p: 2,
                    boxShadow: `0 4px 12px ${alpha(card.color, 0.15)}`,
                  }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.1, mb: 0.5 }}>{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{card.label}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts section ── */}
      {(rawReqs.length > 0 || rawEmps.length > 0) && (
        <>
          <Typography variant="h5" fontWeight={750} sx={{ mb: 2.5, mt: 4 }}>Análisis Organizacional Rápido</Typography>
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
                  <Card sx={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 1,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Solicitudes por Estado</Typography>
                      <Box sx={{ height: 230 }}>
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
              const DEPT_COLORS = ['#10B981','#3B82F6','#F59E0B','#8B5CF6','#FB923C','#F87171','#94A3B8'];
              const chartData = {
                labels: sorted.map(([dept]) => dept),
                datasets: [{ label: 'Empleados', data: sorted.map(([, count]) => count), backgroundColor: DEPT_COLORS, borderRadius: 6, borderWidth: 0 }],
              };
              return (
                <Grid size={{ md: 8, xs: 12 }}>
                  <Card sx={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    p: 1,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Empleados por Departamento</Typography>
                      <Box sx={{ height: 230 }}>
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
