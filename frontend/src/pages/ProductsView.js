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
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import Navbar from '../components/Navbar';
import { getProducts } from '../utils/api';
import { validateDateFormat, validateDateRange } from '../utils/dateValidation';

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

            {/* Products Table */}
            <TableContainer component={Paper} elevation={2}>
              <Typography variant="h6" sx={{ padding: 2 }}>
                Product Details
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Product Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell align="right"><strong>Units Sold</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow
                        key={product.product_id}
                        hover
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell align="right">{product.units_sold.toLocaleString('en-US')}</TableCell>
                        <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No product data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </div>
        )}
      </div>
    </div>
  );
}
