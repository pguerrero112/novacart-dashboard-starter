import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as CustomThemeProvider, useTheme } from './utils/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getMuiTheme } from './theme';
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
          <Route path="/"          element={<Navigate to="/orders" replace />} />
          <Route path="/orders"    element={<OrdersView />} />
          <Route path="/products"  element={<ProductsView />} />
          <Route path="/customers" element={<CustomersView />} />
          <Route path="*"          element={<Navigate to="/orders" replace />} />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}
