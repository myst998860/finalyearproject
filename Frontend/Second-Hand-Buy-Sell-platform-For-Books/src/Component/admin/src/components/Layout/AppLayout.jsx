import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShoppingCart, 
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3
} from 'lucide-react';
import { adminLogout } from '../../../../../services/api';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Books', href: '/admin/books', icon: BookOpen },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login');
    }
  };

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '24px' }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                BookBridge Admin
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ marginBottom: '32px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.name} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => navigate(item.href)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: active ? '#3b82f6' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: active ? '600' : '500'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon style={{ width: '20px', height: '20px' }} />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px' 
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                color: '#6b7280'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0
            }}>
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }}></div>
              Admin Panel
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 