/**
 * OrdersView.js — Orders Overview page
 *
 * This page shows:
 *   - Stat cards: total revenue, total orders, unique customers
 *   - A bar/line chart of monthly revenue over time
 *   - A bar chart of revenue by city/state
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI — charts, stat cards, and layout.
 *
 * Useful libraries already installed:
 *   - recharts: BarChart, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer
 */

import React, { useState, useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper, Chip, Skeleton } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import Navbar from '../components/Navbar';
import ChartExportMenu from '../components/ChartExportMenu';
import { getSummary, getOrders, getCities } from '../utils/api';
import { formatCompactCurrency, exportDataAsCSV } from '../utils/exportUtils';

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [summary,   setSummary]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [cities,    setCities]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const revenueChartRef = useRef(null);
  const cityChartRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  const validateDateFormat = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  };

  const validateDateRange = (start, end) => {
    return new Date(start) <= new Date(end);
  };

  const validateDates = () => {
    return validateDateFormat(startDate) && validateDateFormat(endDate) && validateDateRange(startDate, endDate);
  };

  async function loadData() {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);
    try {
      const [s, o, c] = await Promise.all([
        getSummary(),
        getOrders(startDate, endDate),
        getCities(startDate, endDate),
      ]);
      setSummary(s);
      setOrders(o);
      setCities(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleExportOrders = () => {
    exportDataAsCSV(orders, `orders-${startDate}-to-${endDate}`);
  };

  const handleExportCities = () => {
    exportDataAsCSV(cities, `cities-${startDate}-to-${endDate}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Orders Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor revenue, orders, and customer trends
          </Typography>
        </Box>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <label>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
        </div>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────── */}
        {loading && (
          <>
            {/* Skeleton for stat cards */}
            <Grid container spacing={3} sx={{ marginBottom: 4 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="85%" height={48} />
                        </Box>
                        <Skeleton variant="circular" width={48} height={48} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Skeleton for revenue chart */}
            <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={300} height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} animation="wave" />
            </Paper>

            {/* Skeleton for city chart */}
            <Paper elevation={2} sx={{ padding: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Skeleton variant="text" width={240} height={32} />
                  <Skeleton variant="text" width={280} height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={500} sx={{ mt: 2 }} animation="wave" />
            </Paper>
          </>
        )}

        {/* ── TODO: Build the UI here ────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/* Stat cards with MUI components */}
            <Grid container spacing={3} sx={{ marginBottom: 4 }}>
              {/* Total Revenue Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${summary?.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Orders Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Orders
                        </Typography>
                        <Typography variant="h4" component="div">
                          {summary?.total_orders?.toLocaleString('en-US') || '0'}
                        </Typography>
                      </Box>
                      <ShoppingCartIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Unique Customers Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Unique Customers
                        </Typography>
                        <Typography variant="h4" component="div">
                          {summary?.unique_customers?.toLocaleString('en-US') || '0'}
                        </Typography>
                      </Box>
                      <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly Revenue Chart */}
            <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, position: 'relative' }} ref={revenueChartRef}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Monthly Revenue
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Showing total revenue by month for selected period
                  </Typography>
                </Box>
                {orders.length > 0 && (
                  <Chip
                    label="Export CSV"
                    size="small"
                    onClick={handleExportOrders}
                    clickable
                  />
                )}
              </Box>
              {orders.length > 0 && (
                <ChartExportMenu
                  chartRef={revenueChartRef}
                  data={{ x: orders.map(o => o.month_name), y: orders.map(o => o.revenue) }}
                  xLabel="Month"
                  yLabel="Revenue ($)"
                  filename="monthly-revenue"
                />
              )}
              {orders.length > 0 ? (
                <LineChart
                  xAxis={[{
                    scaleType: 'point',
                    data: orders.map(o => o.month_name),
                    tickLabelStyle: { fontSize: 12 }
                  }]}
                  yAxis={[{
                    valueFormatter: (value) => formatCompactCurrency(value),
                    tickLabelStyle: { fontSize: 11 }
                  }]}
                  series={[
                    {
                      data: orders.map(o => o.revenue),
                      label: 'Revenue',
                      color: '#2196f3',
                      curve: 'linear',
                      showMark: true,
                      valueFormatter: (value) => `$${value != null ? value.toLocaleString() : 0}`,
                    },
                  ]}
                  height={400}
                  margin={{ left: 70, right: 20, top: 20, bottom: 40 }}
                  grid={{ horizontal: true }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No monthly revenue data available
                </Typography>
              )}
            </Paper>

            {/* Revenue by City Chart */}
            <Paper elevation={2} sx={{ padding: 3, position: 'relative' }} ref={cityChartRef}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Revenue by City (Top 10)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Top performing cities by total revenue
                  </Typography>
                </Box>
                {cities.length > 0 && (
                  <Chip
                    label="Export CSV"
                    size="small"
                    onClick={handleExportCities}
                    clickable
                  />
                )}
              </Box>
              {cities.length > 0 && (
                <ChartExportMenu
                  chartRef={cityChartRef}
                  data={{ x: cities.slice(0, 10).map(c => `${c.city}, ${c.state}`), y: cities.slice(0, 10).map(c => c.revenue) }}
                  xLabel="City"
                  yLabel="Revenue ($)"
                  filename="revenue-by-city"
                />
              )}
              {cities.length > 0 ? (
                <BarChart
                  yAxis={[{
                    scaleType: 'band',
                    data: cities.slice(0, 10).map(c => {
                      const cityState = `${c.city}, ${c.state}`;
                      return cityState.length > 18 ? cityState.substring(0, 18) + '...' : cityState;
                    }),
                    tickLabelStyle: { fontSize: 12 }
                  }]}
                  xAxis={[{
                    valueFormatter: (value) => formatCompactCurrency(value),
                    tickLabelStyle: { fontSize: 11 }
                  }]}
                  series={[
                    {
                      data: cities.slice(0, 10).map(c => c.revenue),
                      label: 'Revenue',
                      color: '#4caf50',
                      valueFormatter: (value) => `$${value != null ? value.toLocaleString() : 0}`,
                    },
                  ]}
                  layout="horizontal"
                  height={500}
                  margin={{ left: 10, right: 10, top: 10, bottom: 40 }}
                  grid={{ vertical: true }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No city revenue data available
                </Typography>
              )}
            </Paper>
          </>
        )}
      </div>
    </div>
  );
}
