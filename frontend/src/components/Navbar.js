import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';
import ServiceStatus from './ServiceStatus';
import { ShoppingCart, ClipboardList, Package, Users, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();

  const links = [
    { label: 'Orders',    path: '/orders',    icon: ClipboardList },
    { label: 'Products',  path: '/products',  icon: Package },
    { label: 'Customers', path: '/customers', icon: Users },
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56,
      background: dark ? '#0D1B2A' : '#0D2B4E',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
           onClick={() => navigate('/')}>
        <ShoppingCart size={20} color="#4DB6AC" strokeWidth={2} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>NovaCart</span>
        <span style={{ color: '#4DB6AC', fontSize: 12, marginLeft: 4 }}>Dashboard</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {links.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: active ? 'rgba(77,182,172,0.2)' : 'transparent',
                border: active ? '1px solid #4DB6AC' : '1px solid transparent',
                color: active ? '#4DB6AC' : '#B0BEC5',
                borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}>
              <Icon size={15} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ServiceStatus />
        <button onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center',
            width: 52, height: 28,
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 999, padding: 3, cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}>
          <span style={{
            position: 'absolute',
            top: 2, left: dark ? 27 : 2,
            width: 22, height: 22, borderRadius: '50%',
            background: '#4DB6AC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {dark
              ? <Moon size={13} color="#0D1B2A" strokeWidth={2.25} />
              : <Sun size={13} color="#0D2B4E" strokeWidth={2.25} />}
          </span>
        </button>
      </div>
    </nav>
  );
}
