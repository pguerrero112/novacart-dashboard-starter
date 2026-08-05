/**
 * exportUtils.js - Export utilities for charts and data
 *
 * Handles exporting charts as PNG/SVG and data as CSV
 */

import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

/**
 * Export chart as PNG
 * @param {HTMLElement} element - Chart DOM element
 * @param {string} filename - Filename without extension
 */
export async function exportChartAsPNG(element, filename = 'chart') {
  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // Higher resolution
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    return true;
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export chart as PNG');
  }
}

/**
 * Export chart as SVG
 * @param {HTMLElement} element - Chart DOM element
 * @param {string} filename - Filename without extension
 */
export async function exportChartAsSVG(element, filename = 'chart') {
  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.svg`;
    link.href = dataUrl;
    link.click();

    return true;
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export chart as SVG');
  }
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export data as CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename without extension
 */
export function exportDataAsCSV(data, filename = 'data') {
  try {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${Date.now()}.csv`);
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export data as CSV');
  }
}

/**
 * Export chart data as CSV (from chart data arrays)
 * @param {Array} xData - X-axis data
 * @param {Array} yData - Y-axis data
 * @param {string} xLabel - X-axis label
 * @param {string} yLabel - Y-axis label
 * @param {string} filename - Filename without extension
 */
export function exportChartDataAsCSV(xData, yData, xLabel = 'x', yLabel = 'y', filename = 'chart-data') {
  try {
    const data = xData.map((x, i) => ({
      [xLabel]: x,
      [yLabel]: yData[i]
    }));
    return exportDataAsCSV(data, filename);
  } catch (error) {
    console.error('Error exporting chart data:', error);
    throw new Error('Failed to export chart data as CSV');
  }
}

/**
 * Format number compactly (1500000 -> 1.5M)
 * @param {number} value
 * @returns {string}
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined) return '0';

  const num = Number(value);
  if (isNaN(num)) return '0';

  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Format currency compactly
 * @param {number} value
 * @returns {string}
 */
export function formatCompactCurrency(value) {
  return '$' + formatCompactNumber(value);
}

/**
 * Format currency with full decimals
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (!value) return '$0.00';
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
