import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box, Button, Card, CardContent, CircularProgress, Grid, Typography
} from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveAnnouncements } from '../../api/announcements';
import { getAllEmployees } from '../../api/employees';
import { getAllDocuments } from '../../api/hrDocuments';
import { getAllRequests } from '../../api/hrRequests';

export default function Dashboard() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllEmployees(),
      getAllRequests(),
      getAllDocuments(),
      getActiveAnnouncements()
    ])
      .then(([empRes, reqRes, docRes, annRes]) => {
        const totalEmployees = Array.isArray(empRes.data) ? empRes.data.length : 0;
        const pendingRequests = Array.isArray(reqRes.data) ? reqRes.data.filter(r => r.status === 'Submitted' || r.status === 'InReview').length : 0;
        const activeDocuments = Array.isArray(docRes.data) ? docRes.data.length : 0;
        const recentAnnouncements = Array.isArray(annRes.data) ? annRes.data.length : 0;
        
        setData({ activeDocuments, pendingRequests, recentAnnouncements, totalEmployees });
      })
      .catch(() => setData({ activeDocuments: 0, pendingRequests: 0, recentAnnouncements: 0, totalEmployees: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  const summaryCards = [
    { color: '#2e7d32', icon: <PeopleIcon sx={{ fontSize: 40 }} />, label: 'Total Empleados', value: data?.totalEmployees ?? 0 },
    { color: '#ed6c02', icon: <AssignmentIcon sx={{ fontSize: 40 }} />, label: 'Solicitudes Activas', value: data?.pendingRequests ?? 0 },
    { color: '#1565c0', icon: <DescriptionIcon sx={{ fontSize: 40 }} />, label: 'Documentos Activos', value: data?.activeDocuments ?? 0 },
    { color: '#9c27b0', icon: <CampaignIcon sx={{ fontSize: 40 }} />, label: 'Comunicados Recientes', value: data?.recentAnnouncements ?? 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {keycloak?.tokenParsed?.given_name || keycloak?.tokenParsed?.preferred_username || 'Usuario'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Panel de administración de Recursos Humanos
      </Typography>
      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid size={{ md: 3, sm: 6, xs: 12 }} key={card.label}>
            <Card sx={{ borderTop: `4px solid ${card.color}` }}>
              <CardContent>
                <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                  </Box>
                  <Box sx={{ color: card.color, opacity: 0.7 }}>{card.icon}</Box>
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
    </Box>
  );
}
