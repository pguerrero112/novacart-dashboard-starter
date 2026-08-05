import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import ServiceStatus from './ServiceStatus';
import GlobalSearch from './GlobalSearch';
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [signOutDialog, setSignOutDialog] = useState(false);

  const links = [
    { label: 'Orders', path: '/orders', icon: <BarChartIcon sx={{ mr: 0.5 }} /> },
    { label: 'Products', path: '/products', icon: <InventoryIcon sx={{ mr: 0.5 }} /> },
    { label: 'Customers', path: '/customers', icon: <PeopleIcon sx={{ mr: 0.5 }} /> },
  ];

  const handleSignOutClick = () => {
    setSignOutDialog(true);
  };

  const handleSignOutConfirm = () => {
    logout();
    setSignOutDialog(false);
    navigate('/login');
  };

  const handleSignOutCancel = () => {
    setSignOutDialog(false);
  };

  const handleSearchResultClick = (type, item) => {
    if (type === 'customer') {
      navigate(`/customers?view=${item.customer_id}`);
    } else if (type === 'product') {
      navigate(`/products?view=${item.product_id}`);
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ background: dark ? '#0D1B2A' : '#FFFFFF', borderBottom: dark ? 'none' : '1px solid #E0E6ED' }}>
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
            <ShoppingCartIcon sx={{ fontSize: 28, color: dark ? '#fff' : '#0D2B4E' }} />
            <Typography variant="h6" component="div" sx={{ color: dark ? '#fff' : '#0D2B4E', fontWeight: 700 }}>
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
                    color: active ? '#4DB6AC' : (dark ? '#B0BEC5' : '#455A64'),
                    backgroundColor: active ? 'rgba(77,182,172,0.15)' : 'transparent',
                    border: active ? '1px solid #4DB6AC' : '1px solid transparent',
                    transition: 'all 0.2s ease',
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

          {/* Left: Global Search */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GlobalSearch
              onResultClick={handleSearchResultClick}
            />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 4 }} />

          {/* Right side: Service Status + Theme Toggle + Sign Out */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ServiceStatus />
            <IconButton
              onClick={toggle}
              size="small"
              sx={{
                color: dark ? '#fff' : '#455A64',
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                }
              }}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button
              onClick={handleSignOutClick}
              startIcon={<LogoutIcon />}
              size="small"
              sx={{
                color: dark ? '#fff' : '#455A64',
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                }
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={signOutDialog} onClose={handleSignOutCancel}>
        <DialogTitle>Sign Out</DialogTitle>
        <DialogContent>
          Are you sure you want to sign out?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSignOutCancel}>Cancel</Button>
          <Button onClick={handleSignOutConfirm} variant="contained" color="primary">
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
