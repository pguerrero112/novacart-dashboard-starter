/**
 * ProductsView.js — Product Performance page
 *
 * This page shows:
 *   - A bar chart of top 10 products by revenue
 *   - A table with product name, category, units sold, and revenue
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI.
 */

import React, { useState, useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import Navbar from '../components/Navbar';
import { getProducts } from '../utils/api';

// Format currency helper
function formatCurrency(value) {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)    return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

export default function ProductsView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(startDate, endDate);
      setProducts(data);
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

        <div className="filter-bar">
          <label>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
        </div>

        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && <div className="loading">Loading products data…</div>}

        {!loading && !error && (
          <div className="grid-2">

            {/* Top 10 Products Chart */}
            <Paper elevation={2} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top 10 Products by Revenue
              </Typography>
              {products.length > 0 ? (
                <BarChart
                  yAxis={[{
                    scaleType: 'band',
                    data: products.slice(0, 10).map(p =>
                      p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name
                    ),
                  }]}
                  series={[
                    {
                      data: products.slice(0, 10).map(p => p.revenue),
                      label: 'Revenue ($)',
                      color: '#4caf50',
                    },
                  ]}
                  layout="horizontal"
                  height={400}
                  margin={{ left: 200, right: 20, top: 20, bottom: 40 }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No product data available
                </Typography>
              )}
            </Paper>

            {/*
              STEP 2 — Products table
              Show all products in a table: Name | Category | Units Sold | Revenue
              Hint: use an HTML table or build with divs.
              Format revenue with the formatCurrency helper above.
            */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Product Details</div>
              {/* TODO: add your table here */}
              <div className="loading" style={{ height: 300 }}>
                Implement the products table
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
