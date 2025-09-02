import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Toolbar,
  Typography, Button, Avatar
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  Visibility as VisibilityIcon, Timeline as TimelineIcon,
  ExitToApp as LogoutIcon, NotificationsActive, Public
} from '@mui/icons-material';
import { logout } from '../../redux/actions/authActions';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dispatch = useDispatch();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Social Media Monitoring', icon: <TimelineIcon />, path: '/monitoring/social-media' },
    { text: 'Investment Verification', icon: <VisibilityIcon />, path: '/verification' },
    { text: 'Announcement Verification', icon: <Public />, path: '/verification/announcement' },
    { text: 'Regulatory Dashboard', icon: <NotificationsActive />, path: '/regulator' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" noWrap component="div">
          InvestShield
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                         (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                bgcolor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  color: isActive ? 'primary' : 'inherit',
                  fontWeight: isActive ? 'medium' : 'regular',
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => 
              location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            )?.text || 'Dashboard'}
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <NotificationsActive />
          </IconButton>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            U
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar /> {/* This empty Toolbar creates space below the AppBar */}
        <Outlet /> {/* This is where nested routes will render */}
      </Box>
    </Box>
  );
};

export default MainLayout;