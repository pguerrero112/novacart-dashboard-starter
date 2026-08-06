/**
 * ChartExportMenu.js - Export dropdown for charts
 *
 * Provides PNG, SVG, and CSV export options
 */

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import { exportChartAsPNG, exportChartAsSVG, exportChartDataAsCSV } from '../utils/exportUtils';

export default function ChartExportMenu({ chartRef, data, xLabel = 'x', yLabel = 'y', filename = 'chart' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExportPNG = async () => {
    handleClose();
    try {
      await exportChartAsPNG(chartRef.current, filename);
      showSnackbar('Chart exported as PNG');
    } catch (error) {
      showSnackbar('Failed to export PNG', 'error');
    }
  };

  const handleExportSVG = async () => {
    handleClose();
    try {
      await exportChartAsSVG(chartRef.current, filename);
      showSnackbar('Chart exported as SVG');
    } catch (error) {
      showSnackbar('Failed to export SVG', 'error');
    }
  };

  const handleExportCSV = () => {
    handleClose();
    try {
      if (data) {
        const xData = data.x || data.map((d, i) => i);
        const yData = data.y || data;
        exportChartDataAsCSV(xData, yData, xLabel, yLabel, filename);
        showSnackbar('Data exported as CSV');
      }
    } catch (error) {
      showSnackbar('Failed to export CSV', 'error');
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)'
          }
        }}
        title="Export chart"
      >
        <DownloadIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleExportPNG}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportSVG}>
          <ListItemIcon>
            <CodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as SVG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportCSV} disabled={!data}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Data as CSV</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
