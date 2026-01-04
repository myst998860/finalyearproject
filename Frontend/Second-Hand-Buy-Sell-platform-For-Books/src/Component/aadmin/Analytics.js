import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ShoppingCart,
  DollarSign,
  Activity,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { getAuthHeaders } from '../../services/api';
import { toast } from 'react-toastify';
import { showLogoutConfirmation } from '../ConfirmationToast';
import NotificationBell from './NotificationBell';

const Analytics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // 7, 30, 90 days
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Check organization authentication
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = storedUser.userType?.toLowerCase();

    if (!storedUser.token || (userType !== 'admin' && userType !== 'organization')) {
      toast.error('Access denied. Admin or Organization login required.');
      navigate('/login');
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  // Fetch analytics data with organization token
  const fetchDashboardStats = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/dashboard', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch dashboard stats');
      throw new Error(errorText || 'Failed to fetch dashboard stats');
    }

    return response.json();
  };

  const fetchOrders = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/orders', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch orders');
      throw new Error(errorText || 'Failed to fetch orders');
    }

    return response.json();
  };

  const fetchBooks = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/books', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch books');
      throw new Error(errorText || 'Failed to fetch books');
    }

    return response.json();
  };

  const fetchUsers = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/users?page=0&size=1000', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch users');
      throw new Error(errorText || 'Failed to fetch users');
    }

    const data = await response.json();
    // Handle paginated response
    return Array.isArray(data) ? data : (data.content || data.users || []);
  };

  const fetchOrderAnalytics = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/analytics/orders', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch order analytics');
      throw new Error(errorText || 'Failed to fetch order analytics');
    }

    return response.json();
  };

  const fetchPaymentAnalytics = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/analytics/payments', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch payment analytics');
      throw new Error(errorText || 'Failed to fetch payment analytics');
    }

    return response.json();
  };

  const fetchBusinessAnalytics = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/analytics/business', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed');
      }
      const errorText = await response.text().catch(() => 'Failed to fetch business analytics');
      throw new Error(errorText || 'Failed to fetch business analytics');
    }

    return response.json();
  };

  const downloadPDFReport = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/analytics/pdf', {
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to download analytics PDF');
      throw new Error(errorText || 'Failed to download analytics PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookbridge-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  };

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['organization-analytics-stats'],
    queryFn: fetchDashboardStats,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching dashboard stats:', error);
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      }
    }
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['organization-analytics-orders'],
    queryFn: fetchOrders,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching orders:', error);
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        // Don't show multiple toasts, stats error already handled
        if (!statsError) {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
        }
      }
    }
  });

  const { data: books, isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['organization-analytics-books'],
    queryFn: fetchBooks,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching books:', error);
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        if (!statsError && !ordersError) {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
        }
      }
    }
  });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['organization-analytics-users'],
    queryFn: fetchUsers,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching users:', error);
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        if (!statsError && !ordersError && !booksError) {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
        }
      }
    }
  });

  const { data: orderAnalytics, isLoading: orderAnalyticsLoading, error: orderAnalyticsError } = useQuery({
    queryKey: ['organization-order-analytics'],
    queryFn: fetchOrderAnalytics,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching order analytics:', error);
      // Order analytics is optional, so don't redirect on error
    }
  });

  const { data: paymentAnalytics, isLoading: paymentAnalyticsLoading, error: paymentAnalyticsError } = useQuery({
    queryKey: ['organization-payment-analytics'],
    queryFn: fetchPaymentAnalytics,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching payment analytics:', error);
      // Payment analytics is optional, so don't redirect on error
    }
  });

  const { data: businessAnalytics, isLoading: businessAnalyticsLoading, error: businessAnalyticsError } = useQuery({
    queryKey: ['organization-business-analytics'],
    queryFn: fetchBusinessAnalytics,
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching business analytics:', error);
      // Business analytics is optional, so don't redirect on error
    }
  });

  // Calculate analytics data
  const calculateOrderTrends = () => {
    if (!orders) return [];

    const now = new Date();
    const days = parseInt(selectedPeriod);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      data.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      });
    }

    return data;
  };

  const calculateBookStats = () => {
    if (!books) return {};

    const categories = {};
    const statuses = {};
    const monthlyListings = {};

    books.forEach(book => {
      // Category stats
      const category = book.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;

      // Status stats
      const status = book.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;

      // Monthly listings
      const listingDate = new Date(book.createdAt);
      const monthYear = `${listingDate.getFullYear()}-${String(listingDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyListings[monthYear] = (monthlyListings[monthYear] || 0) + 1;
    });

    return { categories, statuses, monthlyListings };
  };

  const calculateUserStats = () => {
    if (!users || !Array.isArray(users)) return {};

    const userTypes = {};
    const statuses = {};
    const monthlyRegistrations = {};

    users.forEach(user => {
      // User type stats
      const userType = user.userType || 'Unknown';
      userTypes[userType] = (userTypes[userType] || 0) + 1;

      // Status stats
      const status = user.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;

      // Monthly registrations
      const registrationDate = new Date(user.createdAt);
      const monthYear = `${registrationDate.getFullYear()}-${String(registrationDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyRegistrations[monthYear] = (monthlyRegistrations[monthYear] || 0) + 1;
    });

    return { userTypes, statuses, monthlyRegistrations };
  };

  const orderTrends = calculateOrderTrends();
  const bookStats = calculateBookStats();
  const userStats = calculateUserStats();

  const isLoading = statsLoading || ordersLoading || booksLoading || usersLoading ||
    orderAnalyticsLoading || paymentAnalyticsLoading || businessAnalyticsLoading;

  // PDF Download Function
  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadPDFReport();
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleLogout = () => {
    const performLogout = () => {
      localStorage.removeItem('user');
      navigate('/login');
    };
    showLogoutConfirmation(performLogout);
  };

  // Chart Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Check for authentication errors
  const hasAuthError = statsError?.message?.includes('Authentication') ||
    statsError?.message?.includes('401') ||
    statsError?.message?.includes('403') ||
    ordersError?.message?.includes('Authentication') ||
    ordersError?.message?.includes('401') ||
    ordersError?.message?.includes('403');

  if (hasAuthError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', color: '#dc2626', fontWeight: '600' }}>
          Authorization Error
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {statsError?.message || ordersError?.message || 'Authentication failed. Please login again.'}
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        marginBottom: '24px',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Comprehensive insights into your BookBridge platform performance
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <NotificationBell />
            <button
              onClick={() => navigate('/adminpanel')}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              Back to Panel
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isGeneratingPDF ? 0.6 : 1
              }}
            >
              {isGeneratingPDF ? (
                <>
                  <Activity style={{ width: '16px', height: '16px' }} />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download style={{ width: '16px', height: '16px' }} />
                  Download PDF Report
                </>
              )}
            </button>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {user.fullName || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.background = '#dc2626'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Period Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Time Period:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: '7', label: '7 Days' },
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: selectedPeriod === period.value ? '#3b82f6' : 'white',
                      color: selectedPeriod === period.value ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedPeriod === period.value ? '600' : '400'
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Total Users */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fef3c7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  {stats?.totalUsers || users?.length || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
              </div>
            </div>
          </div>

          {/* Book Revenue */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#ede9fe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  Rs. {stats?.bookRevenue || 0}/-
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Book Revenue</div>
              </div>
            </div>
          </div>

          {/* Tutorial Revenue */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fef3c7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  Rs. {stats?.tutorialRevenue || 0}/-
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Tutorial Revenue ({stats?.tutorialSales || 0} sales)
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#dcfce7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                  Rs. {stats?.totalRevenue || 0}/-
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Combined Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Order Trends Chart */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              Order Trends (Last {selectedPeriod} Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (Rs.)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend Chart */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (Rs.)" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Book Categories Chart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              Book Categories Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(bookStats.categories || {}).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              Book Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={Object.entries(bookStats.statuses || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(bookStats.statuses || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Analytics Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              User Registration Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={Object.entries(userStats.monthlyRegistrations || {}).map(([month, count]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                users: count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="#fef3c7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
              User Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={Object.entries(userStats.userTypes || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(userStats.userTypes || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backend Analytics Data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginTop: '32px'
        }}>
          {/* Order Analytics from Backend */}
          {orderAnalytics && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
                Order Analytics (Backend)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Orders</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{orderAnalytics.totalOrders || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Orders This Month</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{orderAnalytics.ordersThisMonth || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Pending Orders</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{orderAnalytics.pendingOrders || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Delivered Orders</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{orderAnalytics.deliveredOrders || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Book Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {orderAnalytics.bookRevenue || orderAnalytics.totalRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Tutorial Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {orderAnalytics.tutorialRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Revenue (Combined)</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {orderAnalytics.totalRevenue || 0}/-</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Analytics from Backend */}
          {paymentAnalytics && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
                Payment Analytics (Backend)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Payments</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{paymentAnalytics.totalPayments || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Completed Payments</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{paymentAnalytics.completedPayments || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Pending Payments</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{paymentAnalytics.pendingPayments || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fee2e2', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Failed Payments</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{paymentAnalytics.failedPayments || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Book Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {paymentAnalytics.bookRevenue || paymentAnalytics.totalRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Tutorial Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {paymentAnalytics.tutorialRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Revenue (Combined)</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {paymentAnalytics.totalRevenue || 0}/-</span>
                </div>
              </div>
            </div>
          )}

          {/* Business Analytics from Backend */}
          {businessAnalytics && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
                Business Analytics (Backend)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Users</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{businessAnalytics.totalUsers || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Active Users</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{businessAnalytics.activeUsers || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>New Users This Month</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{businessAnalytics.newUsersThisMonth || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Books</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{businessAnalytics.totalBooks || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Book Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {businessAnalytics.bookRevenue || businessAnalytics.orderRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Tutorial Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {businessAnalytics.tutorialRevenue || 0}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ede9fe', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Total Business Revenue</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {businessAnalytics.totalRevenue || 0}/-</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settlement Tracking Table */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Payment Settlement from Platform
          </h3>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Order #</th>
                  <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Order Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Platform Settlement</th>
                  <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Settled Date</th>
                </tr>
              </thead>
              <tbody>
                {orders?.filter(o => o.status === 'DELIVERED').map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1f2937' }}>{order.orderNumber}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4b5563' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                      Rs. {order.totalAmount}/-
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: order.orgPaymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2',
                        color: order.orgPaymentStatus === 'PAID' ? '#15803d' : '#991b1b'
                      }}>
                        {order.orgPaymentStatus || 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4b5563' }}>
                      {order.orgPaymentClearedAt ? new Date(order.orgPaymentClearedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {(!orders || orders.filter(o => o.status === 'DELIVERED').length === 0) && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      No delivered orders found for settlement tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

