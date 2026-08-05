/**
 * ProductDetailModal.js - Product detail dialog
 *
 * Shows product stats, sales data, and visualizations
 * Clean, minimal design
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartExportMenu from './ChartExportMenu';
import { formatCompactCurrency, exportDataAsCSV } from '../utils/exportUtils';

export default function ProductDetailModal({ product, open, onClose }) {
  const salesChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  if (!product) return null;

  const avgPrice = product.revenue / product.units_sold;
  const stats = [
    { label: 'Units Sold', value: product.units_sold.toLocaleString(), icon: <InventoryIcon />, color: '#2196f3' },
    { label: 'Total Revenue', value: formatCompactCurrency(product.revenue), icon: <TrendingUpIcon />, color: '#4caf50' },
    { label: 'Avg Price', value: formatCompactCurrency(avgPrice), icon: <AttachMoneyIcon />, color: '#ff9800' },
    { label: 'Category', value: product.category, icon: <LocalOfferIcon />, color: '#9c27b0', isText: true }
  ];

  // Sample data (would come from API)
  const salesData = [
    { month: 'Jan', units: 120 },
    { month: 'Feb', units: 180 },
    { month: 'Mar', units: 150 },
    { month: 'Apr', units: 220 },
    { month: 'May', units: 190 },
    { month: 'Jun', units: 250 }
  ];

  const cityData = [
    { city: 'New York', revenue: 45000 },
    { city: 'Los Angeles', revenue: 38000 },
    { city: 'Chicago', revenue: 32000 },
    { city: 'Houston', revenue: 28000 },
    { city: 'Phoenix', revenue: 25000 }
  ];

  const handleExportSales = () => {
    exportDataAsCSV(cityData, `product-${product.name}-sales`);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <Chip label={product.category} size="small" color="primary" variant="outlined" />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stats Row */}
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

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, position: 'relative' }} ref={salesChartRef}>
              <Typography variant="subtitle2" gutterBottom>Units Sold Over Time</Typography>
              <ChartExportMenu
                chartRef={salesChartRef}
                data={{ x: salesData.map(d => d.month), y: salesData.map(d => d.units) }}
                xLabel="Month"
                yLabel="Units"
                filename={`product-${product.name}-sales`}
              />
              <LineChart
                xAxis={[{ scaleType: 'point', data: salesData.map(d => d.month) }]}
                series={[{ data: salesData.map(d => d.units), color: '#4caf50', showMark: true, curve: 'linear' }]}
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, position: 'relative' }} ref={revenueChartRef}>
              <Typography variant="subtitle2" gutterBottom>Top Cities by Revenue</Typography>
              <ChartExportMenu
                chartRef={revenueChartRef}
                data={{ x: cityData.map(d => d.city), y: cityData.map(d => d.revenue) }}
                xLabel="City"
                yLabel="Revenue ($)"
                filename={`product-${product.name}-cities`}
              />
              <BarChart
                yAxis={[{ scaleType: 'band', data: cityData.map(d => d.city) }]}
                series={[{ data: cityData.map(d => d.revenue), color: '#ff9800' }]}
                layout="horizontal"
                height={300}
                margin={{ left: 80, right: 20, top: 20, bottom: 30 }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Sales by Location Table */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Sales by Location</Typography>
          <Chip
            label="Export CSV"
            size="small"
            onClick={handleExportSales}
            clickable
          />
        </Box>
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cityData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.city}</TableCell>
                  <TableCell align="right">{formatCompactCurrency(row.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
