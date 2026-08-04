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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import Navbar from '../components/Navbar';
import { getSummary, getOrders, getCities } from '../utils/api';

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [summary,   setSummary]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [cities,    setCities]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
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

            {/*
              STEP 2 — Monthly revenue chart
              orders is an array of: { month, month_name, order_count, revenue }
              Use a BarChart or LineChart from recharts.
              Hint: XAxis dataKey="month_name", Bar dataKey="revenue"
            */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>Monthly Revenue</div>
              {/* TODO: add your chart here */}
              <div className="loading" style={{ height: 200 }}>
                Implement the monthly revenue chart using recharts BarChart
              </div>
            </div>

            {/*
              STEP 3 — Revenue by city chart
              cities is an array of: { city, state, order_count, revenue }
              Use a horizontal BarChart (layout="vertical").
              Show top 10 cities only.
              Hint: .slice(0, 10) on cities array
            */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Revenue by City</div>
              {/* TODO: add your chart here */}
              <div className="loading" style={{ height: 200 }}>
                Implement the cities chart using recharts BarChart with layout="vertical"
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
