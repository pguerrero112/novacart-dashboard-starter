/**
 * GlobalSearch.js - Global search component for navbar
 *
 * Server-side search across products and customers with debouncing
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';

import { useTheme } from '../utils/ThemeContext';
import { search } from '../utils/api';

export default function GlobalSearch({ onResultClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], products: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Clear results if query is too short
    if (!query || query.length < 2) {
      setResults({ customers: [], products: [] });
      setLoading(false);
      return;
    }

    // Set loading state
    setLoading(true);

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce API call by 300ms
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await search(query, 5); // Limit to 5 results per category
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults({ customers: [], products: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

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
        fullWidth
        size="small"
        placeholder="Search products, customers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={16} sx={{ color: dark ? '#fff' : '#455A64' }} />
              ) : (
                <SearchIcon fontSize="small" sx={{ color: dark ? '#fff' : '#455A64' }} />
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {query && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  aria-label="Clear search"
                  sx={{
                    padding: '8px',
                    marginRight: '-8px',
                    '&:hover': {
                      backgroundColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CloseIcon
                    sx={{
                      color: dark ? '#fff' : '#000',
                      fontSize: '20px'
                    }}
                  />
                </IconButton>
              )}
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
