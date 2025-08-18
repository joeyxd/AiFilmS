import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  VideoLibrary as ProjectsIcon,
  Movie as EditorIcon,
  PermMedia as MediaIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signOut } from '../store/slices/authSlice';
import { setSidebarOpen } from '../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
    { text: 'Media Library', icon: <MediaIcon />, path: '/media' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: sidebarOpen ? 'none' : 'block' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            FilmStudio AI Platform
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar / Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleSignOut}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer to push content below AppBar */}
        <Box sx={{ flexGrow: 1, py: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
