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

import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper, TextField, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import Navbar from '../components/Navbar';
import { getSummary, getOrders, getCities } from '../utils/api';
import { validateDateFormat, validateDateRange } from '../utils/dateValidation';

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [summary,   setSummary]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [cities,    setCities]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [dateErrors, setDateErrors] = useState({ start: '', end: '', range: '' });

  useEffect(() => { loadData(); }, []);

  const validateDates = () => {
    const errors = { start: '', end: '', range: '' };
    let isValid = true;

    if (!validateDateFormat(startDate)) {
      errors.start = 'Invalid date format (YYYY-MM-DD)';
      isValid = false;
    }
    if (!validateDateFormat(endDate)) {
      errors.end = 'Invalid date format (YYYY-MM-DD)';
      isValid = false;
    }
    if (isValid && !validateDateRange(startDate, endDate)) {
      errors.range = 'Start date must be before or equal to end date';
      isValid = false;
    }

    setDateErrors(errors);
    return isValid;
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            label="From"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            error={!!dateErrors.start}
            helperText={dateErrors.start}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="To"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            error={!!dateErrors.end}
            helperText={dateErrors.end}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={loadData}
            size="medium"
            sx={{ height: 40 }}
          >
            Apply
          </Button>
          {dateErrors.range && (
            <Typography variant="body2" color="error" sx={{ width: '100%', mt: -1 }}>
              {dateErrors.range}
            </Typography>
          )}
        </Box>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────── */}
        {loading && <div className="loading">Loading orders data…</div>}

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
            <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              {orders.length > 0 ? (
                <LineChart
                  xAxis={[{
                    scaleType: 'point',
                    data: orders.map(o => o.month_name),
                    label: 'Month'
                  }]}
                  series={[
                    {
                      data: orders.map(o => o.revenue),
                      label: 'Revenue ($)',
                      color: '#2196f3',
                      curve: 'linear',
                      showMark: true
                    },
                  ]}
                  height={300}
                  margin={{ left: 70, right: 20, top: 20, bottom: 40 }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No monthly revenue data available
                </Typography>
              )}
            </Paper>

            {/* Revenue by City Chart */}
            <Paper elevation={2} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue by City (Top 10)
              </Typography>
              {cities.length > 0 ? (
                <BarChart
                  yAxis={[{
                    scaleType: 'band',
                    data: cities.slice(0, 10).map(c => `${c.city}, ${c.state}`),
                  }]}
                  series={[
                    {
                      data: cities.slice(0, 10).map(c => c.revenue),
                      label: 'Revenue ($)',
                      color: '#f50057',
                    },
                  ]}
                  layout="horizontal"
                  height={400}
                  margin={{ left: 150, right: 20, top: 20, bottom: 40 }}
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
