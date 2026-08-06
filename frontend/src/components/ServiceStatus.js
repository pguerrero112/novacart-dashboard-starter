import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';

export default function ServiceStatus() {
  const { healthStatus, fetchHealthStatus } = useData();
  const [status, setStatus] = useState('checking');
  const [detail, setDetail] = useState('');

  async function check() {
    const health = await fetchHealthStatus();
    setStatus(health.status);
    setDetail(health.detail);
  }

  useEffect(() => {
    // If we already have cached health status, use it immediately
    if (healthStatus) {
      setStatus(healthStatus.status);
      setDetail(healthStatus.detail);
    } else {
      // Otherwise fetch it
      check();
    }

    // Check every 30 seconds (will use cache if less than 30s old)
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [healthStatus]);

  const colors = { healthy: '#00897B', degraded: '#F9A825', error: '#C62828', checking: '#90A4AE' };
  const labels = { healthy: 'Service healthy', degraded: 'Degraded', error: 'Offline', checking: 'Checking…' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} title={detail}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: colors[status],
        boxShadow: status === 'healthy' ? `0 0 6px ${colors[status]}` : 'none',
        display: 'inline-block',
      }} />
      <span style={{ color: colors[status], fontWeight: 500 }}>{labels[status]}</span>
    </div>
  );
}
