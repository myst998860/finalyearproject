import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Eye, 
  Search, 
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package
} from 'lucide-react';
import { getAllOrders, updateOrderStatus, getImageUrl } from '../services/api.js';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function AdminOrders() {
  // Add authentication redirect hook
  useAuthRedirect();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Show 10 orders per page
  const queryClient = useQueryClient();

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(15deg); }
        50% { transform: translateY(-10px) rotate(20deg); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0px) rotate(-10deg); }
        50% { transform: translateY(-8px) rotate(-15deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      @keyframes slideIn {
        0% { 
          opacity: 0; 
          transform: translateY(-20px) scale(0.95); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      setSuccessMessage('Order status updated successfully!');
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error('Update order status error:', error);
      let errorMessage = 'Failed to update order status';
      
      if (error.message.includes('403')) {
        errorMessage = 'Access denied. Please login as admin again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication required. Please login as admin.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Order not found.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
    }
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  }) || [];

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'processing':
        return '#8b5cf6';
      case 'shipped':
        return '#06b6d4';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
        <div style={{ color: '#991b1b' }}>Error loading orders: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          Orders Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage and track all orders in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
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
                {orders?.length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Orders</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
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
              <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {orders?.filter(o => o.status === 'PENDING').length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Pending Orders</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
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
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {orders?.filter(o => o.status === 'DELIVERED').length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Delivered Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search orders by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#374151' }}>
            Orders ({filteredOrders.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Order #</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{order.user?.fullName}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{order.user?.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <strong>Rs. {order.totalAmount}</strong>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'white',
                      background: getStatusColor(order.status)
                    }}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => viewOrderDetails(order)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          color: '#374151',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                        View
                      </button>
                      
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '24px',
          gap: '10px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Book Icons */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '80px',
                opacity: '0.1',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <div style={{
                  width: '40px',
                  height: '50px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '120px',
                opacity: '0.1',
                animation: 'float2 4s ease-in-out infinite'
              }}>
                <div style={{
                  width: '35px',
                  height: '45px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Book Image from Order */}
                  <div style={{
                    width: '60px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                  }}
                  >
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      <img 
                        src={getImageUrl(selectedOrder.orderItems[0].book?.image || selectedOrder.orderItems[0].book?.bookImage)} 
                        alt={selectedOrder.orderItems[0].book?.title || 'Book'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback Book Icon */}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '4px',
                      position: 'relative',
                      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                      display: selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Book lines */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        right: '8px',
                        height: '2px',
                        background: '#667eea',
                        borderRadius: '1px'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '8px',
                        right: '8px',
                        height: '2px',
                        background: '#667eea',
                        borderRadius: '1px'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: '8px',
                        right: '8px',
                        height: '2px',
                        background: '#667eea',
                        borderRadius: '1px'
                      }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'shimmer 3s ease-in-out infinite'
                    }}>
                      📋 Order Details
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ 
                        margin: 0, 
                        opacity: 0.9, 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Order #{selectedOrder.orderNumber}
                      </p>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowOrderDetails(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Decorative line */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)'
              }}></div>
            </div>

            {/* Content */}
            <div style={{ 
              padding: '24px 24px 0 24px', 
              maxHeight: 'calc(90vh - 140px)', 
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              {/* Order Summary */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>ORDER DATE</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>STATUS</div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      background: getStatusColor(selectedOrder.status)
                    }}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>TOTAL AMOUNT</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                      Rs. {selectedOrder.totalAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  👤 Customer Information
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>NAME</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                        {selectedOrder.user?.fullName}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>EMAIL</div>
                      <div style={{ fontSize: '16px', color: '#1e293b' }}>
                        {selectedOrder.user?.email}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>PHONE</div>
                      <div style={{ fontSize: '16px', color: '#1e293b' }}>
                        {selectedOrder.deliveryPhone}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>DELIVERY ADDRESS</div>
                      <div style={{ fontSize: '16px', color: '#1e293b' }}>
                        {selectedOrder.deliveryAddress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📚 Order Items ({selectedOrder.orderItems?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} style={{ 
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {/* Book Image */}
                        <div style={{ 
                          width: '100px', 
                          height: '120px', 
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                          <img 
                            src={getImageUrl(item.book?.image || item.book?.bookImage)} 
                            alt={item.book?.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x120/f3f4f6/9ca3af?text=No+Image';
                            }}
                          />
                        </div>
                        
                        {/* Book Details */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '120px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '6px', color: '#1e293b' }}>
                              {item.book?.title}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                              by {item.book?.author}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ 
                              background: '#f1f5f9', 
                              padding: '6px 12px', 
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#475569'
                            }}>
                              Qty: {item.quantity}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                              Rs. {item.unitPrice}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              borderRadius: '0 0 16px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success/Error Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '400px',
            width: '90%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: successMessage.includes('successfully') 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {successMessage.includes('successfully') ? (
                    <CheckCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  ) : (
                    <AlertCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {successMessage.includes('successfully') ? 'Success!' : 'Error'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                    {successMessage.includes('successfully') ? 'Operation completed' : 'Something went wrong'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <p style={{ 
                margin: 0, 
                fontSize: '16px', 
                color: '#374151',
                lineHeight: '1.5'
              }}>
                {successMessage}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              borderRadius: '0 0 16px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: successMessage.includes('successfully') ? '#10b981' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 