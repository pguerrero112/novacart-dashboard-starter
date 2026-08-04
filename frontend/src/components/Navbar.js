import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../utils/ThemeContext';
import ServiceStatus from './ServiceStatus';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();

  const links = [
    { label: 'Orders', path: '/orders', icon: <BarChartIcon sx={{ mr: 0.5 }} /> },
    { label: 'Products', path: '/products', icon: <InventoryIcon sx={{ mr: 0.5 }} /> },
    { label: 'Customers', path: '/customers', icon: <PeopleIcon sx={{ mr: 0.5 }} /> },
  ];

  return (
    <AppBar position="sticky" sx={{ background: dark ? '#0D1B2A' : '#0D2B4E' }}>
      <Toolbar>
        {/* Logo / Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            mr: 4
          }}
          onClick={() => navigate('/')}
        >
          <ShoppingCartIcon sx={{ fontSize: 28, color: '#fff' }} />
          <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: 700 }}>
            NovaCart
          </Typography>
          <Typography variant="caption" sx={{ color: '#4DB6AC', ml: 0.5 }}>
            Dashboard
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {links.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <Button
                key={path}
                onClick={() => navigate(path)}
                startIcon={icon}
                sx={{
                  color: active ? '#4DB6AC' : '#B0BEC5',
                  backgroundColor: active ? 'rgba(77,182,172,0.15)' : 'transparent',
                  border: active ? '1px solid #4DB6AC' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(77,182,172,0.2)',
                    border: '1px solid rgba(77,182,172,0.5)',
                  }
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        {/* Right side: Service Status + Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ServiceStatus />
          <IconButton
            onClick={toggle}
            color="inherit"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255,255,255,0.08)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
              }
            }}
          >
            {dark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
