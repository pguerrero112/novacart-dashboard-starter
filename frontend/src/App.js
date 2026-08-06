import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as CustomThemeProvider, useTheme } from './utils/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getMuiTheme } from './theme';
import { AuthProvider } from './utils/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginView from './pages/LoginView';
import OrdersView   from './pages/OrdersView';
import ProductsView from './pages/ProductsView';
import CustomersView from './pages/CustomersView';
import './App.css';

function AppContent() {
  const { dark } = useTheme();
  const muiTheme = getMuiTheme(dark);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/orders" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}
