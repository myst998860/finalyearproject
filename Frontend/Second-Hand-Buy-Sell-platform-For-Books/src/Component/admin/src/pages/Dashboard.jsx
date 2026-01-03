import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { getDashboardStats } from '../services/api.js';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Dashboard() {
  // Add authentication redirect hook
  useAuthRedirect();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        window.location.href = '/admin/login';
      }
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
        <div style={{ color: '#991b1b' }}>Error loading dashboard: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Overview of your platform
        </p>
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#dcfce7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users style={{ width: '24px', height: '24px', color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>
                Total Users
              </div>
              <div style={{ fontSize: '14px', color: '#10b981' }}>
                +{stats?.newUsersThisMonth || 0} from last month
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#ede9fe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                Rs. {stats?.bookRevenue || stats?.totalRevenue || 0}/-
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>
                Book Revenue
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                From book sales
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#ede9fe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                Rs. {stats?.totalRevenue || 0}/-
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>
                Total Revenue
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Books + Videos
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#fef3c7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              < DollarSign style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                Rs. {stats?.tutorialRevenue || 0}/-
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>
                Tutorial Revenue
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {stats?.tutorialSales || 0} video sales
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Recent Orders
            </h3>
            <ShoppingCart style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                #1234
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Saurab Doe
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Rs. 500/-
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: '#dcfce7',
                color: '#166534'
              }}>
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
