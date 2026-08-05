/**
 * auth.js - Authentication utility functions
 *
 * Simple client-side authentication for demo purposes
 * Uses localStorage to persist authentication state
 */

const AUTH_KEY = 'nc-auth';

// Default credentials
const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

/**
 * Attempt to login with provided credentials
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if login successful
 */
export function login(username, password) {
  if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
    const authData = {
      isAuthenticated: true,
      username: username,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    return true;
  }
  return false;
}

/**
 * Logout and clear authentication state
 */
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Check if user is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return false;

  try {
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true;
  } catch {
    return false;
  }
}

/**
 * Get current user data
 * @returns {object|null}
 */
export function getCurrentUser() {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;

  try {
    return JSON.parse(authData);
  } catch {
    return null;
  }
}
