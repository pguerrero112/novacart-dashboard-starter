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

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Tooltip,
  Skeleton
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import Navbar from '../components/Navbar';
import ProductDetailModal from '../components/ProductDetailModal';
import ChartExportMenu from '../components/ChartExportMenu';
import { getProducts, getProductById } from '../utils/api';
import { exportDataAsCSV, formatCompactCurrency } from '../utils/exportUtils';

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const productsChartRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const productId = searchParams.get('view');
    if (productId && products.length > 0) {
      // Compare as strings to handle both string and number IDs
      const product = products.find(p => String(p.product_id) === String(productId));
      if (product) {
        setSelectedProduct(product);
      } else {
        // Product not in top 10, fetch individually
        fetchIndividualProduct(productId);
      }
    }
  }, [searchParams, products]);

  async function fetchIndividualProduct(productId) {
    try {
      const product = await getProductById(productId, startDate, endDate);
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
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
      const data = await getProducts(startDate, endDate);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setSearchParams({ view: product.product_id });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSearchParams({});
  };

  const handleExportData = () => {
    exportDataAsCSV(products, `products-${startDate}-to-${endDate}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* Page Header */}
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Product Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze product sales and revenue trends
          </Typography>
        </Box>

        <div className="filter-bar" style={{ marginBottom: 20 }} role="search" aria-label="Filter products by date range">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            aria-label="Start date"
          />
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            aria-label="End date"
          />
          <button className="btn-apply" onClick={loadData} aria-label="Apply date range filter">Apply</button>
          <Chip
            label="Export CSV"
            onClick={handleExportData}
            clickable
            disabled={products.length === 0}
            sx={{ marginLeft: 'auto' }}
            aria-label="Export product data as CSV"
          />
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}
          >
            Error: {error}
          </div>
        )}

        {loading && (
          <Paper elevation={2} sx={{ padding: 3, position: 'relative' }}>
            <Skeleton variant="text" width="30%" height={30} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />

            <Box className="grid-2" sx={{ gap: 3 }}>
              {/* Chart skeleton */}
              <Skeleton variant="rectangular" height={500} animation="wave" />

              {/* Table skeleton */}
              <Box>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} variant="text" height={50} sx={{ mb: 1 }} animation="wave" />
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {!loading && !error && (
          <Paper elevation={2} sx={{ padding: 3, position: 'relative' }}>
            {/* Combined Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Top 10 Products by Revenue
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best performing products in the selected period
                </Typography>
              </Box>
            </Box>

            <Box className="grid-2" sx={{ gap: 3 }}>
              {/* Chart Section */}
              <Box
                ref={productsChartRef}
                sx={{ position: 'relative' }}
                role="img"
                aria-label="Bar chart showing top 10 products by revenue"
              >
                {products.length > 0 && (
                  <ChartExportMenu
                    chartRef={productsChartRef}
                    data={{
                      x: products.slice(0, 10).map(p => p.name),
                      y: products.slice(0, 10).map(p => p.revenue)
                    }}
                    xLabel="Product"
                    yLabel="Revenue ($)"
                    filename="top-products"
                  />
                )}
                {products.length > 0 ? (
                  <>
                    <BarChart
                      yAxis={[{
                        scaleType: 'band',
                        data: products.slice(0, 10).map(p => {
                          const maxLength = 18; // Length of "Noise Cancelling"
                          return p.name.length > maxLength ? p.name.substring(0, maxLength) + '...' : p.name;
                        }),
                        tickLabelStyle: { fontSize: 12 }
                      }]}
                      xAxis={[{
                        valueFormatter: (value) => formatCompactCurrency(value),
                        tickLabelStyle: { fontSize: 11 }
                      }]}
                      series={[
                        {
                          data: products.slice(0, 10).map(p => p.revenue),
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
                    <div className="sr-only">
                      Top 10 products by revenue: {products.slice(0, 10).map(p =>
                        `${p.name}: ${formatCurrency(p.revenue)}`
                      ).join(', ')}
                    </div>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No product data available
                  </Typography>
                )}
              </Box>

              {/* Table Section */}
              <TableContainer sx={{ maxHeight: 600 }} role="region" aria-label="Product performance data table">
              <Table stickyHeader aria-label="Product performance with revenue and units sold">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} scope="col">Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} scope="col">Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} scope="col">Units Sold</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }} scope="col">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => {
                      const displayName = product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name;
                      return (
                        <TableRow
                          key={product.product_id}
                          hover
                          onClick={() => handleRowClick(product)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleRowClick(product);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${product.name}`}
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 137, 123, 0.08)'
                            },
                            '&:focus': {
                              outline: '2px solid #00897B',
                              outlineOffset: '-2px'
                            }
                          }}
                        >
                          <TableCell>
                            {product.name.length > 30 ? (
                              <Tooltip title={product.name} arrow>
                                <span>{displayName}</span>
                              </Tooltip>
                            ) : (
                              product.name
                            )}
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell align="right">{product.units_sold.toLocaleString('en-US')}</TableCell>
                          <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                        </TableRow>
                      );
                    })
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
            </Box>
          </Paper>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          open={Boolean(selectedProduct)}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
