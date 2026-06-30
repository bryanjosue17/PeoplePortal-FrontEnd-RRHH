import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Empleados', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Documentos', icon: <DescriptionIcon />, path: '/documents' },
  { text: 'Solicitudes', icon: <AssignmentIcon />, path: '/requests' },
  { text: 'Comunicados', icon: <CampaignIcon />, path: '/announcements' },
  { text: 'Beneficios', icon: <CardGiftcardIcon />, path: '/benefits' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports' },
];

export default function Layout({ children }) {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    keycloak.logout();
  };

  const token = keycloak?.tokenParsed;
  const userName = token?.name || token?.preferred_username || 'Usuario';
  const userEmail = token?.email || '';
  const userAvatar = userName.charAt(0).toUpperCase();

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          PeoplePortal
        </Typography>
        <Typography variant="caption" color="text.secondary">
          RRHH
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              mx: 1, borderRadius: 2, mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' },
                '& .MuiListItemIcon-root': { color: 'white' },
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {menuItems.find(i => location.pathname === i.path || (i.path !== '/dashboard' && location.pathname.startsWith(i.path)))?.text || 'RRHH'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {userName}
            </Typography>
            <Avatar
              onClick={handleMenuOpen}
              sx={{ bgcolor: 'primary.main', cursor: 'pointer', width: 36, height: 36, fontSize: 16 }}
            >
              {userAvatar}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">{userEmail}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1, p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          mt: 8
        }}
      >
        {children}
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar closeOnClick theme="colored" />
      </Box>
    </Box>
  );
}
