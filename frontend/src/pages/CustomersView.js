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
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import Navbar from '../components/Navbar';
import CustomerDetailModal from '../components/CustomerDetailModal';
import { useData } from '../contexts/DataContext';
import { getCustomerById } from '../utils/api';
import { exportDataAsCSV } from '../utils/exportUtils';

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomersView() {
  const { customers, dateRange, fetchCustomersData } = useData();
  const [startDate,  setStartDate]  = useState(dateRange.start);
  const [endDate,    setEndDate]    = useState(dateRange.end);
  const [sortBy,     setSortBy]     = useState('total_spent');
  const [sortDir,    setSortDir]    = useState('desc');
  const [loading,    setLoading]    = useState(!customers);
  const [error,      setError]      = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!customers) {
      loadData();
    }
  }, []);

  // Handle opening modal from URL parameter
  useEffect(() => {
    const customerId = searchParams.get('view');
    if (customerId && customers && customers.length > 0) {
      // Compare as strings to handle both string and number IDs
      const customer = customers.find(c => String(c.customer_id) === String(customerId));
      if (customer) {
        setSelectedCustomer(customer);
      } else {
        // Customer not in top 20, fetch individually
        fetchIndividualCustomer(customerId);
      }
    }
  }, [searchParams, customers]);

  async function fetchIndividualCustomer(customerId) {
    try {
      const customer = await getCustomerById(customerId, startDate, endDate);
      setSelectedCustomer(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }

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
      await fetchCustomersData(startDate, endDate);
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
  const sorted = customers ? [...customers].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  }) : [];

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
    setSearchParams({ view: customer.customer_id });
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setSearchParams({});
  };

  const handleExportData = () => {
    exportDataAsCSV(customers || [], `customers-${startDate}-to-${endDate}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Customer Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and analyze customer purchasing behavior
          </Typography>
        </Box>

        <div className="filter-bar">
          <label>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
          <Chip
            label="Export CSV"
            onClick={handleExportData}
            clickable
            disabled={!customers || customers.length === 0}
            sx={{ marginLeft: 'auto' }}
          />
        </div>

        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && (
          <TableContainer component={Paper} elevation={2}>
            <Box sx={{ padding: 2 }}>
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="80%" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
                    <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
                    <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" animation="wave" /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" animation="wave" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
                      onClick={() => handleRowClick(customer)}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 137, 123, 0.08)'
                        }
                      }}
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

        {/* Customer Detail Modal */}
        <CustomerDetailModal
          customer={selectedCustomer}
          open={Boolean(selectedCustomer)}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
