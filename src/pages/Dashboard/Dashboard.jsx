import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import {
  Grid, Card, CardContent, Typography, Button, Box, CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import CampaignIcon from '@mui/icons-material/Campaign';
import { getAllEmployees } from '../../api/employees';
import { getAllRequests } from '../../api/hrRequests';
import { getAllDocuments } from '../../api/hrDocuments';
import { getActiveAnnouncements } from '../../api/announcements';

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
        
        setData({ totalEmployees, pendingRequests, activeDocuments, recentAnnouncements });
      })
      .catch(() => setData({ totalEmployees: 0, pendingRequests: 0, activeDocuments: 0, recentAnnouncements: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  const summaryCards = [
    { label: 'Total Empleados', value: data?.totalEmployees ?? 0, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#2e7d32' },
    { label: 'Solicitudes Activas', value: data?.pendingRequests ?? 0, icon: <AssignmentIcon sx={{ fontSize: 40 }} />, color: '#ed6c02' },
    { label: 'Documentos Activos', value: data?.activeDocuments ?? 0, icon: <DescriptionIcon sx={{ fontSize: 40 }} />, color: '#1565c0' },
    { label: 'Comunicados Recientes', value: data?.recentAnnouncements ?? 0, icon: <CampaignIcon sx={{ fontSize: 40 }} />, color: '#9c27b0' },
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            <Card sx={{ borderTop: `4px solid ${card.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Acciones Rápidas</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Button variant="contained" fullWidth sx={{ py: 2 }} onClick={() => navigate('/employees')}>
            Gestionar Empleados
          </Button>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Button variant="contained" color="secondary" fullWidth sx={{ py: 2 }} onClick={() => navigate('/documents')}>
            Revisar Documentos
          </Button>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Button variant="contained" color="warning" fullWidth sx={{ py: 2 }} onClick={() => navigate('/requests')}>
            Solicitudes
          </Button>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Button variant="contained" color="secondary" fullWidth sx={{ py: 2 }} onClick={() => navigate('/announcements')}>
            Nuevo Comunicado
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
