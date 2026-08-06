/**
 * exportUtils.js - Export utilities for charts and data
 *
 * Handles exporting charts as PNG/SVG and data as CSV
 */

import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

/**
 * Check if the app is currently in dark mode
 */
function isDarkMode() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * Export chart as PNG
 * @param {HTMLElement} element - Chart DOM element
 * @param {string} filename - Filename without extension
 */
export async function exportChartAsPNG(element, filename = 'chart') {
  // Collect all elements and their original styles
  const exportButtons = element.querySelectorAll('button[title="Export chart"], .chart-export-button');
  const allTextElements = element.querySelectorAll('text, tspan, .MuiChartsLegend-label, .MuiTypography-root, h1, h2, h3, h4, h5, h6, p, span, div');
  const allLineElements = element.querySelectorAll('line');
  const allPathElements = element.querySelectorAll('path');

  const savedStyles = {
    buttons: [],
    texts: [],
    lines: [],
    paths: []
  };

  try {
    // 1. Hide export buttons
    exportButtons.forEach((el, i) => {
      savedStyles.buttons[i] = el.style.display;
      el.style.display = 'none';
    });

    // 2. Make all text black and fully visible
    allTextElements.forEach((el, i) => {
      savedStyles.texts[i] = {
        fill: el.getAttribute('fill'),
        styleFill: el.style.fill,
        color: el.style.color,
        opacity: el.style.opacity,
        visibility: el.style.visibility,
        display: el.style.display
      };
      el.setAttribute('fill', '#000000');
      el.style.fill = '#000000';
      el.style.color = '#000000';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.display = '';
    });

    // 3. Make all lines dark
    allLineElements.forEach((el, i) => {
      savedStyles.lines[i] = {
        stroke: el.getAttribute('stroke'),
        styleStroke: el.style.stroke
      };
      el.setAttribute('stroke', '#333333');
      el.style.stroke = '#333333';
    });

    // 4. Make paths with stroke (but not fill) dark
    allPathElements.forEach((el, i) => {
      const fill = el.getAttribute('fill') || el.style.fill;
      const stroke = el.getAttribute('stroke') || el.style.stroke;

      savedStyles.paths[i] = {
        stroke: el.getAttribute('stroke'),
        styleStroke: el.style.stroke
      };

      // Only modify paths that are stroked lines (fill=none) not filled shapes
      if (fill === 'none' && stroke) {
        el.setAttribute('stroke', '#333333');
        el.style.stroke = '#333333';
      }
    });

    // Wait for changes to apply
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
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
  } finally {
    // Restore everything
    exportButtons.forEach((el, i) => {
      el.style.display = savedStyles.buttons[i] || '';
    });

    allTextElements.forEach((el, i) => {
      const saved = savedStyles.texts[i];
      if (saved) {
        if (saved.fill !== null && saved.fill !== undefined) {
          el.setAttribute('fill', saved.fill);
        } else {
          el.removeAttribute('fill');
        }
        el.style.fill = saved.styleFill || '';
        el.style.color = saved.color || '';
        el.style.opacity = saved.opacity || '';
        el.style.visibility = saved.visibility || '';
        el.style.display = saved.display || '';
      }
    });

    allLineElements.forEach((el, i) => {
      const saved = savedStyles.lines[i];
      if (saved) {
        if (saved.stroke !== null && saved.stroke !== undefined) {
          el.setAttribute('stroke', saved.stroke);
        } else {
          el.removeAttribute('stroke');
        }
        el.style.stroke = saved.styleStroke || '';
      }
    });

    allPathElements.forEach((el, i) => {
      const saved = savedStyles.paths[i];
      if (saved) {
        if (saved.stroke !== null && saved.stroke !== undefined) {
          el.setAttribute('stroke', saved.stroke);
        }
        if (saved.styleStroke !== null && saved.styleStroke !== undefined) {
          el.style.stroke = saved.styleStroke;
        }
      }
    });
  }
}

/**
 * Export chart as SVG
 * @param {HTMLElement} element - Chart DOM element
 * @param {string} filename - Filename without extension
 */
export async function exportChartAsSVG(element, filename = 'chart') {
  // Collect all elements and their original styles
  const exportButtons = element.querySelectorAll('button[title="Export chart"], .chart-export-button');
  const allTextElements = element.querySelectorAll('text, tspan, .MuiChartsLegend-label, .MuiTypography-root, h1, h2, h3, h4, h5, h6, p, span, div');
  const allLineElements = element.querySelectorAll('line');
  const allPathElements = element.querySelectorAll('path');

  const savedStyles = {
    buttons: [],
    texts: [],
    lines: [],
    paths: []
  };

  try {
    // 1. Hide export buttons
    exportButtons.forEach((el, i) => {
      savedStyles.buttons[i] = el.style.display;
      el.style.display = 'none';
    });

    // 2. Make all text black and fully visible
    allTextElements.forEach((el, i) => {
      savedStyles.texts[i] = {
        fill: el.getAttribute('fill'),
        styleFill: el.style.fill,
        color: el.style.color,
        opacity: el.style.opacity,
        visibility: el.style.visibility,
        display: el.style.display
      };
      el.setAttribute('fill', '#000000');
      el.style.fill = '#000000';
      el.style.color = '#000000';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.display = '';
    });

    // 3. Make all lines dark
    allLineElements.forEach((el, i) => {
      savedStyles.lines[i] = {
        stroke: el.getAttribute('stroke'),
        styleStroke: el.style.stroke
      };
      el.setAttribute('stroke', '#333333');
      el.style.stroke = '#333333';
    });

    // 4. Make paths with stroke (but not fill) dark
    allPathElements.forEach((el, i) => {
      const fill = el.getAttribute('fill') || el.style.fill;
      const stroke = el.getAttribute('stroke') || el.style.stroke;

      savedStyles.paths[i] = {
        stroke: el.getAttribute('stroke'),
        styleStroke: el.style.stroke
      };

      // Only modify paths that are stroked lines (fill=none) not filled shapes
      if (fill === 'none' && stroke) {
        el.setAttribute('stroke', '#333333');
        el.style.stroke = '#333333';
      }
    });

    // Wait for changes to apply
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture
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
  } finally {
    // Restore everything
    exportButtons.forEach((el, i) => {
      el.style.display = savedStyles.buttons[i] || '';
    });

    allTextElements.forEach((el, i) => {
      const saved = savedStyles.texts[i];
      if (saved) {
        if (saved.fill !== null && saved.fill !== undefined) {
          el.setAttribute('fill', saved.fill);
        } else {
          el.removeAttribute('fill');
        }
        el.style.fill = saved.styleFill || '';
        el.style.color = saved.color || '';
        el.style.opacity = saved.opacity || '';
        el.style.visibility = saved.visibility || '';
        el.style.display = saved.display || '';
      }
    });

    allLineElements.forEach((el, i) => {
      const saved = savedStyles.lines[i];
      if (saved) {
        if (saved.stroke !== null && saved.stroke !== undefined) {
          el.setAttribute('stroke', saved.stroke);
        } else {
          el.removeAttribute('stroke');
        }
        el.style.stroke = saved.styleStroke || '';
      }
    });

    allPathElements.forEach((el, i) => {
      const saved = savedStyles.paths[i];
      if (saved) {
        if (saved.stroke !== null && saved.stroke !== undefined) {
          el.setAttribute('stroke', saved.stroke);
        }
        if (saved.styleStroke !== null && saved.styleStroke !== undefined) {
          el.style.stroke = saved.styleStroke;
        }
      }
    });
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
