import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography
} from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 240;

const menuItems = [
  { icon: <DashboardIcon />, path: '/dashboard', text: 'Dashboard' },
  { icon: <PeopleIcon />, path: '/employees', text: 'Empleados' },
  { icon: <DescriptionIcon />, path: '/documents', text: 'Documentos' },
  { icon: <AssignmentIcon />, path: '/requests', text: 'Solicitudes' },
  { icon: <CampaignIcon />, path: '/announcements', text: 'Comunicados' },
  { icon: <CardGiftcardIcon />, path: '/benefits', text: 'Beneficios' },
  { icon: <AssessmentIcon />, path: '/reports', text: 'Reportes' },
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
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
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
              '&.Mui-selected': {
                '& .MuiListItemIcon-root': { color: 'white' },
                '&:hover': { backgroundColor: 'primary.dark' },
                backgroundColor: 'primary.main',
                color: 'white',
              }, borderRadius: 2, mb: 0.5, mx: 1
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
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          color: 'text.primary',
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {menuItems.find(i => location.pathname === i.path || (i.path !== '/dashboard' && location.pathname.startsWith(i.path)))?.text || 'RRHH'}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { sm: 'block', xs: 'none' } }}>
              {userName}
            </Typography>
            <Avatar
              onClick={handleMenuOpen}
              sx={{ bgcolor: 'primary.main', cursor: 'pointer', fontSize: 16, height: 36, width: 36 }}
            >
              {userAvatar}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
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
        sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { md: 'none', xs: 'block' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { md: 'block', xs: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          bgcolor: 'background.default',
          boxSizing: 'border-box',
          flexGrow: 1,
          minHeight: '100vh',
          minWidth: 0,
          mt: 8,
          overflow: 'hidden',
          p: { sm: 3, xs: 2 },
          width: { md: `calc(100% - ${drawerWidth}px)`, xs: '100%' },
        }}
      >
        {children}
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar closeOnClick theme="colored" />
      </Box>
    </Box>
  );
}
