import React, { createContext, useContext, useState } from 'react';
import { getSummary, getOrders, getCities, getProducts, getCustomers, getHealth } from '../utils/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState(null);
  const [cities, setCities] = useState(null);
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '2022-01-01', end: '2022-12-31' });
  const [healthStatus, setHealthStatus] = useState(null);
  const [lastHealthCheck, setLastHealthCheck] = useState(null);

  // Fetch orders data
  const fetchOrdersData = async (startDate, endDate, force = false) => {
    // Only fetch if data doesn't exist, dates changed, or forced
    const datesChanged = startDate !== dateRange.start || endDate !== dateRange.end;

    if (!force && !datesChanged && summary && orders && cities) {
      return { summary, orders, cities };
    }

    const [s, o, c] = await Promise.all([
      getSummary(),
      getOrders(startDate, endDate),
      getCities(startDate, endDate),
    ]);

    setSummary(s);
    setOrders(o);
    setCities(c);
    setDateRange({ start: startDate, end: endDate });

    return { summary: s, orders: o, cities: c };
  };

  // Fetch products data
  const fetchProductsData = async (startDate, endDate, force = false) => {
    const datesChanged = startDate !== dateRange.start || endDate !== dateRange.end;

    if (!force && !datesChanged && products) {
      return products;
    }

    const data = await getProducts(startDate, endDate);
    setProducts(data);
    setDateRange({ start: startDate, end: endDate });

    return data;
  };

  // Fetch customers data
  const fetchCustomersData = async (startDate, endDate, force = false) => {
    const datesChanged = startDate !== dateRange.start || endDate !== dateRange.end;

    if (!force && !datesChanged && customers) {
      return customers;
    }

    const data = await getCustomers(startDate, endDate);
    setCustomers(data);
    setDateRange({ start: startDate, end: endDate });

    return data;
  };

  // Fetch health status (only refetch if more than 30 seconds old or forced)
  const fetchHealthStatus = async (force = false) => {
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds

    if (!force && healthStatus && lastHealthCheck && (now - lastHealthCheck) < CACHE_DURATION) {
      return healthStatus;
    }

    try {
      const data = await getHealth();
      const newStatus = {
        status: data.status === 'healthy' ? 'healthy' : 'degraded',
        detail: data.database?.status === 'connected' ? 'Connected' : 'DB issue',
      };
      setHealthStatus(newStatus);
      setLastHealthCheck(now);
      return newStatus;
    } catch {
      const errorStatus = {
        status: 'error',
        detail: 'Backend unreachable',
      };
      setHealthStatus(errorStatus);
      setLastHealthCheck(now);
      return errorStatus;
    }
  };

  // Clear all cached data (use when you know DB changed)
  const invalidateAll = () => {
    setSummary(null);
    setOrders(null);
    setCities(null);
    setProducts(null);
    setCustomers(null);
    setHealthStatus(null);
    setLastHealthCheck(null);
  };

  return (
    <DataContext.Provider
      value={{
        summary,
        orders,
        cities,
        products,
        customers,
        dateRange,
        healthStatus,
        lastHealthCheck,
        fetchOrdersData,
        fetchProductsData,
        fetchCustomersData,
        fetchHealthStatus,
        invalidateAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
