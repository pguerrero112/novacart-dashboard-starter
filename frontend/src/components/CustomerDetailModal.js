/**
 * CustomerDetailModal.js - Customer detail dialog
 *
 * Shows customer stats, order history, and visualizations
 * Clean, minimal design to avoid crowding
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import ChartExportMenu from './ChartExportMenu';
import { formatCompactCurrency, exportDataAsCSV } from '../utils/exportUtils';
import { getOrders } from '../utils/api';

export default function CustomerDetailModal({ customer, open, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const spendingChartRef = useRef(null);
  const categoryChartRef = useRef(null);

  useEffect(() => {
    if (open && customer) {
      loadCustomerData();
    }
  }, [open, customer]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      // Use existing orders endpoint - filter on frontend
      const allOrders = await getOrders('2022-01-01', '2022-12-31');
      // In real implementation, filter by customer_id if available in order data
      setOrders(allOrders.slice(0, 10)); // Placeholder: show sample orders
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const avgOrderValue = customer.total_spent / customer.total_orders;
  const stats = [
    { label: 'Total Orders', value: customer.total_orders, icon: <ShoppingCartIcon />, color: '#2196f3' },
    { label: 'Total Spent', value: formatCompactCurrency(customer.total_spent), icon: <AttachMoneyIcon />, color: '#4caf50' },
    { label: 'Avg Order Value', value: formatCompactCurrency(avgOrderValue), icon: <TrendingUpIcon />, color: '#ff9800' },
    { label: 'Member Since', value: '2022', icon: <CalendarTodayIcon />, color: '#9c27b0' }
  ];

  // Sample data for charts (would come from API in real implementation)
  const spendingData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 1500 },
    { month: 'Apr', amount: 2200 },
    { month: 'May', amount: 1900 },
    { month: 'Jun', amount: 2500 }
  ];

  const categoryData = [
    { id: 0, label: 'Electronics', value: 35 },
    { id: 1, label: 'Clothing', value: 25 },
    { id: 2, label: 'Home', value: 20 },
    { id: 3, label: 'Sports', value: 15 },
    { id: 4, label: 'Other', value: 5 }
  ];

  const handleExportOrders = () => {
    exportDataAsCSV(orders, `customer-${customer.name}-orders`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          {customer.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {customer.city}, {customer.state}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stats Row - Clean 4-column grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={1}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6">{stat.value}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row - Simple 2-column layout */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, position: 'relative' }} ref={spendingChartRef}>
              <Typography variant="subtitle2" gutterBottom>Spending Over Time</Typography>
              <ChartExportMenu
                chartRef={spendingChartRef}
                data={{ x: spendingData.map(d => d.month), y: spendingData.map(d => d.amount) }}
                xLabel="Month"
                yLabel="Amount ($)"
                filename={`customer-${customer.name}-spending`}
              />
              <LineChart
                xAxis={[{ scaleType: 'point', data: spendingData.map(d => d.month) }]}
                series={[{ data: spendingData.map(d => d.amount), color: '#2196f3', showMark: true }]}
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, position: 'relative' }} ref={categoryChartRef}>
              <Typography variant="subtitle2" gutterBottom>Categories Purchased</Typography>
              <ChartExportMenu
                chartRef={categoryChartRef}
                data={{ x: categoryData.map(d => d.label), y: categoryData.map(d => d.value) }}
                xLabel="Category"
                yLabel="Percentage"
                filename={`customer-${customer.name}-categories`}
              />
              <PieChart
                series={[{
                  data: categoryData,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30 }
                }]}
                height={300}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Orders Table - Clean and simple */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Order History</Typography>
          <Chip
            label="Export CSV"
            size="small"
            onClick={handleExportOrders}
            clickable
          />
        </Box>
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index} hover>
                  <TableCell>{order.month_name}</TableCell>
                  <TableCell align="right">{formatCompactCurrency(order.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
