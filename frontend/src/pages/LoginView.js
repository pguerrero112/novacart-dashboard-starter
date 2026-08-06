/**
 * LoginView.js - Login page
 *
 * Entry point to the application
 * Default credentials: admin/password
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../utils/AuthContext';

export default function LoginView() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/orders';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(username, password);

    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D2B4E',
        padding: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          animation: shake ? 'shake 0.5s' : 'none',
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-10px)' },
            '75%': { transform: 'translateX(10px)' }
          }
        }}
        elevation={8}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#0D2B4E', mb: 1 }} />
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#333'
              }}
            >
              NovaCart
            </Typography>
            <Typography variant="caption" sx={{ color: '#4DB6AC', fontSize: '0.9rem' }}>
              Dashboard
            </Typography>
          </Box>

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#555'
            }}
          >
            Sign in to your dashboard
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: '#0D2B4E',
                '&:hover': {
                  background: '#0A2239'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#999', mt: 2 }}>
            Demo credentials: admin / password
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}