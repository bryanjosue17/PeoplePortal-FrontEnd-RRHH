import DiceAvatar from './DiceAvatar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CampaignIcon from '@mui/icons-material/Campaign';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MenuIcon from '@mui/icons-material/Menu';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import {
  AppBar, Badge, Box, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useThemeContext } from '../context/ThemeContext';
import { getAllRequests } from '../api/hrRequests';

const drawerWidth = 240;

const menuItems = [
  { icon: <DashboardIcon />, path: '/dashboard', text: 'Dashboard' },
  { icon: <PeopleIcon />, path: '/employees', text: 'Empleados' },
  { icon: <DescriptionIcon />, path: '/documents', text: 'Documentos' },
  { icon: <AssignmentIcon />, path: '/requests', text: 'Solicitudes' },
  { icon: <CampaignIcon />, path: '/announcements', text: 'Comunicados' },
  { icon: <CardGiftcardIcon />, path: '/benefits', text: 'Beneficios' },
  { icon: <MonetizationOnIcon />, path: '/nomina', text: 'Nómina' },
  { icon: <ManageAccountsIcon />, path: '/users', text: 'Usuarios' },
  { icon: <AssessmentIcon />, path: '/reports', text: 'Reportes' },
];

export default function Layout({ children }) {
  const { user: tokenParsed, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const intervalRef = useRef(null);

  const { themeMode, toggleThemeMode } = useThemeContext();
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);

  useEffect(() => {
    const check = () => {
      getAllRequests()
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          setPendingCount(list.filter(r => r.status === 'Submitted' || r.status === 'InReview').length);
        })
        .catch(() => {});
    };
    check();
    intervalRef.current = setInterval(check, 60_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };


  const handleThemeMenuOpen = (e) => setThemeAnchorEl(e.currentTarget);
  const handleThemeMenuClose = () => setThemeAnchorEl(null);
  const handleThemeSelect = (mode) => {
    toggleThemeMode(mode);
    handleThemeMenuClose();
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return <Brightness7Icon />;
    if (themeMode === 'dark') return <Brightness4Icon />;
    return <SettingsBrightnessIcon />;
  };

  const userName = tokenParsed?.name || tokenParsed?.preferred_username || 'Usuario';
  const userEmail = tokenParsed?.email || '';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, p: 2.5, pb: 2 }}>
        <Box
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            borderRadius: 2,
            color: '#022C22',
            display: 'flex',
            fontSize: 18,
            fontWeight: 800,
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}
        >
          P
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2 }}>
            PeoplePortal
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            RRHH
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                mx: 1.5,
                mb: 0.5,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.15))',
                  borderLeft: '4px solid #10B981',
                  color: 'primary.main',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(14,165,233,0.2))',
                  }
                },
                '&:hover': {
                  background: 'rgba(16,185,129,0.08)',
                  transform: 'translateX(3px)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.main' : 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
            <IconButton
              color="inherit"
              sx={{ color: 'text.secondary' }}
              onClick={() => navigate('/requests')}
              title={`${pendingCount} solicitudes pendientes`}
            >
              <Badge badgeContent={pendingCount > 0 ? pendingCount : null} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleThemeMenuOpen} sx={{ mr: 1, color: 'text.secondary' }}>
              {getThemeIcon()}
            </IconButton>
            <Menu
              anchorEl={themeAnchorEl}
              open={Boolean(themeAnchorEl)}
              onClose={handleThemeMenuClose}
            >
              <MenuItem onClick={() => handleThemeSelect('light')} selected={themeMode === 'light'}>
                <ListItemIcon><Brightness7Icon fontSize="small" /></ListItemIcon>
                Claro
              </MenuItem>
              <MenuItem onClick={() => handleThemeSelect('dark')} selected={themeMode === 'dark'}>
                <ListItemIcon><Brightness4Icon fontSize="small" /></ListItemIcon>
                Oscuro
              </MenuItem>
              <MenuItem onClick={() => handleThemeSelect('system')} selected={themeMode === 'system'}>
                <ListItemIcon><SettingsBrightnessIcon fontSize="small" /></ListItemIcon>
                Sistema
              </MenuItem>
            </Menu>

            <Typography variant="body2" sx={{ display: { sm: 'block', xs: 'none' } }}>
              {userName}
            </Typography>
            <DiceAvatar
              seed={userEmail || userName}
              size={36}
              sx={{ cursor: 'pointer' }}
              onClick={handleMenuOpen}
            />
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
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Mi Perfil
              </MenuItem>
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.85) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 100%)',
              backdropFilter: 'blur(16px)',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
            display: { md: 'none', xs: 'block' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.85) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 100%)',
              backdropFilter: 'blur(16px)',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
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
