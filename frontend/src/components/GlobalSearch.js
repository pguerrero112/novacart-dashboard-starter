/**
 * GlobalSearch.js - Global search component for navbar
 *
 * Searches across products and customers with minimal UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';

import { useTheme } from '../utils/ThemeContext';

export default function GlobalSearch({ customers, products, onResultClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], products: [] });
  const [showResults, setShowResults] = useState(false);
  const { dark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ customers: [], products: [] });
      return;
    }

    const searchLower = query.toLowerCase();

    // Search customers
    const customerMatches = (customers || []).filter(c =>
      c.name?.toLowerCase().includes(searchLower) ||
      c.city?.toLowerCase().includes(searchLower) ||
      c.state?.toLowerCase().includes(searchLower)
    ).slice(0, 3);

    // Search products
    const productMatches = (products || []).filter(p =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower)
    ).slice(0, 3);

    setResults({ customers: customerMatches, products: productMatches });
  }, [query, customers, products]);

  const handleResultClick = (type, item) => {
    setQuery('');
    setShowResults(false);
    if (onResultClick) {
      onResultClick(type, item);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  const hasResults = results.customers.length > 0 || results.products.length > 0;

  return (
    <Box sx={{ position: 'relative', width: 300 }}>
      <TextField
        size="small"
        placeholder="Search products, customers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: dark ? '#fff' : '#455A64' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <CloseIcon fontSize="small" sx={{ color: dark ? '#fff' : '#455A64' }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.04)',
            color: dark ? '#fff' : '#1A2332',
            '& input': {
              color: dark ? '#fff' : '#1A2332'
            },
            '& input::placeholder': {
              color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              opacity: 1
            },
            '&:hover': {
              backgroundColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)'
            },
            '&.Mui-focused': {
              backgroundColor: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)'
            }
          }
        }}
      />

      {showResults && hasResults && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1000
          }}
        >
          {results.customers.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                CUSTOMERS ({results.customers.length})
              </Typography>
              <List dense>
                {results.customers.map((customer) => (
                  <ListItem
                    key={customer.customer_id}
                    button
                    onClick={() => handleResultClick('customer', customer)}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                    <ListItemText
                      primary={customer.name}
                      secondary={`${customer.city}, ${customer.state}`}
                    />
                  </ListItem>
                ))}
              </List>
              {results.products.length > 0 && <Divider />}
            </>
          )}

          {results.products.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                PRODUCTS ({results.products.length})
              </Typography>
              <List dense>
                {results.products.map((product) => (
                  <ListItem
                    key={product.product_id}
                    button
                    onClick={() => handleResultClick('product', product)}
                  >
                    <InventoryIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                    <ListItemText
                      primary={product.name}
                      secondary={product.category}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      {showResults && query.length >= 2 && !hasResults && (
        <Paper elevation={8} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, p: 2, zIndex: 1000 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No results found for "{query}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
