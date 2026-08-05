/**
 * CustomersView.js — Customer List page
 *
 * This page shows:
 *   - A sortable table of top 20 customers by revenue
 *   - Columns: Name | City | State | Orders | Total Spent
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI and the sorting logic.
 */

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import Navbar from '../components/Navbar';
import { getCustomers } from '../utils/api';
import { validateDateFormat, validateDateRange } from '../utils/dateValidation';

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomersView() {
  const [startDate,  setStartDate]  = useState('2022-01-01');
  const [endDate,    setEndDate]    = useState('2022-12-31');
  const [customers,  setCustomers]  = useState([]);
  const [sortBy,     setSortBy]     = useState('total_spent');
  const [sortDir,    setSortDir]    = useState('desc');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
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
      const data = await getCustomers(startDate, endDate);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sort handler — toggles direction if same column, resets to desc if new column
  function handleSort(column) {
    if (sortBy === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  // Apply sort to customers array
  const sorted = [...customers].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  // Sort indicator helper
  const sortIcon = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

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
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center' }}>
            {customers.length} customers
          </Typography>
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

        {loading && <div className="loading">Loading customers…</div>}

        {!loading && !error && (
          <TableContainer component={Paper} elevation={2}>
            <Typography variant="h6" sx={{ padding: 2 }}>
              Top Customers by Revenue
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortDir : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      <strong>Customer Name</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'city'}
                      direction={sortBy === 'city' ? sortDir : 'asc'}
                      onClick={() => handleSort('city')}
                    >
                      <strong>City</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'state'}
                      direction={sortBy === 'state' ? sortDir : 'asc'}
                      onClick={() => handleSort('state')}
                    >
                      <strong>State</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'total_orders'}
                      direction={sortBy === 'total_orders' ? sortDir : 'asc'}
                      onClick={() => handleSort('total_orders')}
                    >
                      <strong>Total Orders</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'total_spent'}
                      direction={sortBy === 'total_spent' ? sortDir : 'asc'}
                      onClick={() => handleSort('total_spent')}
                    >
                      <strong>Total Spent</strong>
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.length > 0 ? (
                  sorted.map((customer) => (
                    <TableRow
                      key={customer.customer_id}
                      hover
                      sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.state}</TableCell>
                      <TableCell align="right">{customer.total_orders.toLocaleString('en-US')}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.total_spent)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No customer data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
