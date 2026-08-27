/**
 * OrdersView.js — Orders Overview page (View 1)
 *
 * Stat cards (total revenue, total orders) + monthly revenue trend chart +
 * revenue-by-state chart, all scoped to the selected date range.
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, ArrowRight, DollarSign, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getOrders, getCountries } from '../utils/api';

function formatCurrencyCompact(value) {
  if (!value) return '$0';
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000)    return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatCurrencyFull(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function friendlyError(err) {
  if (err.message === 'Failed to fetch') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  return err.message || 'Something went wrong loading the orders overview.';
}

const tooltipStyle = {
  contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 },
  labelStyle:   { color: 'var(--text-secondary)', marginBottom: 4 },
  itemStyle:    { color: 'var(--text-primary)' },
};

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [orders,    setOrders]    = useState([]);
  const [states,    setStates]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { loadData(); }, []);

  // /franchise/{id}/summary has no start/end params — it always returns
  // all-time totals, so it can't power date-scoped stat cards. Total
  // revenue/orders are derived instead from the already date-scoped
  // /orders response, which stays in sync with the other charts.
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [o, c] = await Promise.all([
        getOrders(1, startDate, endDate),
        getCountries(1, startDate, endDate),
      ]);
      setOrders(o);
      setStates(c.filter(row => row.revenue > 0));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = orders.reduce((sum, row) => sum + (row.revenue || 0), 0);
  const totalOrders  = orders.reduce((sum, row) => sum + (row.order_count || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <label><Calendar size={14} /> From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label><Calendar size={14} /> To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>
            Apply <ArrowRight size={14} />
          </button>
        </div>

        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && <div className="loading">Loading orders overview…</div>}

        {!loading && !error && (
          <>
            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <div className="stat-row">
              <div className="stat-box">
                <div className="icon-badge"><DollarSign size={20} /></div>
                <div>
                  <div className="label">Total Revenue</div>
                  <div className="value">{formatCurrencyCompact(totalRevenue)}</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="icon-badge blue"><ShoppingBag size={20} /></div>
                <div>
                  <div className="label">Total Orders</div>
                  <div className="value">{totalOrders.toLocaleString('en-US')}</div>
                </div>
              </div>
            </div>

            {/* ── Monthly revenue chart ───────────────────────────────────── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>Monthly Revenue</div>
              {orders.length === 0 ? (
                <div className="loading">No orders in this date range.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={orders} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="month_name"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      label={{ value: 'Month', position: 'insideBottom', offset: -16, fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={formatCurrencyCompact}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      label={{ value: 'Revenue', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [formatCurrencyFull(value), 'Revenue']}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Revenue by state chart ──────────────────────────────────── */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Revenue by State</div>
              {states.length === 0 ? (
                <div className="loading">No revenue in this date range.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, states.length * 36)}>
                  <BarChart
                    data={states}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 24 }}
                  >
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis
                      type="number"
                      tickFormatter={formatCurrencyCompact}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                      label={{ value: 'Revenue', position: 'insideBottom', offset: -16, fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="state"
                      width={50}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [formatCurrencyFull(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="var(--blue)" radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
