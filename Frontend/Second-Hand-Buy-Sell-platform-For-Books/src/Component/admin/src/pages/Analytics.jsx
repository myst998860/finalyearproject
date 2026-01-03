import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { getDashboardStats, getAllOrders, getAllBooks, getAllUsers, getOrderAnalytics, getPaymentAnalytics, getBusinessAnalytics, downloadAnalyticsPDF } from '../services/api.js';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Analytics() {
  // Add authentication redirect hook
  useAuthRedirect();

  const [selectedPeriod, setSelectedPeriod] = useState('30'); // 7, 30, 90 days
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch analytics data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: getDashboardStats,
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

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: getAllOrders,
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

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['analytics-books'],
    queryFn: getAllBooks,
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

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: getAllUsers,
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

  // Additional analytics data from backend
  const { data: orderAnalytics, isLoading: orderAnalyticsLoading } = useQuery({
    queryKey: ['order-analytics'],
    queryFn: getOrderAnalytics,
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

  const { data: paymentAnalytics, isLoading: paymentAnalyticsLoading } = useQuery({
    queryKey: ['payment-analytics'],
    queryFn: getPaymentAnalytics,
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

  const { data: businessAnalytics, isLoading: businessAnalyticsLoading } = useQuery({
    queryKey: ['business-analytics'],
    queryFn: getBusinessAnalytics,
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
    if (!users) return {};

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

  // PDF Download Function - Updated to use backend generation
  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadAnalyticsPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Chart Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Comprehensive insights into your BookBridge platform performance
          </p>
        </div>
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
      </div>

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
              background: '#dbeafe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats?.totalOrders || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Orders</div>
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
              <DollarSign style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                Rs. {stats?.bookRevenue || stats?.totalRevenue || 0}/-
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Book Revenue</div>
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
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Tutorial Revenue</div>
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
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Revenue</div>
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
                {stats?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f3e8ff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {stats?.totalBooks || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Books</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>Total Revenue</span>
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
                <span style={{ fontSize: '14px', color: '#374151' }}>Tutorial Revenue</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {paymentAnalytics.tutorialRevenue || 0}/-</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>Total Revenue (Books + Tutorials)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>Available Books</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{businessAnalytics.availableBooks || 0}</span>
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
    </div>
  );
} 