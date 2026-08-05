/**
 * Date validation utilities for NovaCart Dashboard
 */

/**
 * Validates if a date string is in YYYY-MM-DD format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid format, false otherwise
 */
export const validateDateFormat = (dateString) => {
  if (!dateString) return false;

  // Check format with regex: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Check if it's a valid date (handles invalid dates like 2022-13-45)
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString().startsWith(dateString);
};

/**
 * Validates that start date is before or equal to end date
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {boolean} True if start <= end, false otherwise
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end;
};

/**
 * Returns user-friendly error message based on error type
 * @param {string} errorType - Type of error ('format', 'range', 'required')
 * @returns {string} User-friendly error message
 */
export const getDateErrorMessage = (errorType) => {
  const messages = {
    format: 'Invalid date format (YYYY-MM-DD)',
    range: 'Start date must be before or equal to end date',
    required: 'This field is required'
  };

  return messages[errorType] || 'Invalid input';
};
