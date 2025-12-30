import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { getAllOrders, updateOrderStatus, getImageUrl, getAuthHeaders } from '../../services/api';
import { toast } from 'react-toastify';
import { showLogoutConfirmation } from '../ConfirmationToast';
import './Order.css';

const Order = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const queryClient = useQueryClient();

  // Check organization authentication
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = storedUser.userType?.toLowerCase();
    
    if (!storedUser.token || userType !== 'organization') {
      toast.error('Access denied. Organization login required.');
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
  }, [navigate]);

  // Add CSS animations
  useEffect(() => {
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

  // Fetch orders with organization token
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
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  };

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['organization-orders'],
    queryFn: fetchOrders,
    enabled: !!user, // Only fetch when user is authenticated
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        navigate('/login');
      }
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const headers = getAuthHeaders();
      const response = await fetch(`http://localhost:8082/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-orders']);
      setSuccessMessage('Order status updated successfully!');
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error('Update order status error:', error);
      let errorMessage = 'Failed to update order status';
      
      if (error.message.includes('403')) {
        errorMessage = 'Access denied. Please login again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication required. Please login.';
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
  useEffect(() => {
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

  const handleLogout = () => {
    const performLogout = () => {
      localStorage.removeItem('user');
      navigate('/login');
    };
    showLogoutConfirmation(performLogout);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="order-page">
        <div className="order-loading">
          <div>Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page">
        <div className="order-error">
          <div>Error loading orders: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      {/* Header */}
      <header className="order-header">
        <div className="order-header-content">
          <div className="order-logo-section">
            <h1 className="order-logo">Lunasu Crochet</h1>
            <span className="order-badge">Organization Orders</span>
          </div>
          <div className="order-header-actions">
            <button className="order-back-btn" onClick={() => navigate('/adminpanel')}>
              Back to Panel
            </button>
            <span className="order-user-name">{user.fullName || user.email}</span>
            <button className="order-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="order-main">
        {/* Page Header */}
        <div className="order-page-header">
          <h1 className="order-page-title">Orders Management</h1>
          <p className="order-page-subtitle">Manage and track all orders in the system</p>
        </div>

        {/* Stats Cards */}
        <div className="order-stats-grid">
          <div className="order-stat-card">
            <div className="order-stat-icon" style={{ background: '#dbeafe' }}>
              <ShoppingCart style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <div className="order-stat-content">
              <div className="order-stat-number">{orders?.length || 0}</div>
              <div className="order-stat-label">Total Orders</div>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon" style={{ background: '#fef3c7' }}>
              <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <div className="order-stat-content">
              <div className="order-stat-number">{orders?.filter(o => o.status === 'PENDING').length || 0}</div>
              <div className="order-stat-label">Pending Orders</div>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon" style={{ background: '#dcfce7' }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <div className="order-stat-content">
              <div className="order-stat-number">{orders?.filter(o => o.status === 'DELIVERED').length || 0}</div>
              <div className="order-stat-label">Delivered Orders</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="order-search-filter">
          <div className="order-search-input-wrapper">
            <input
              type="text"
              placeholder="Search orders by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="order-search-input"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="order-filter-select"
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
        <div className="order-table-container">
          <div className="order-table-header">
            <h3 className="order-table-title">Orders ({filteredOrders.length})</h3>
          </div>

          <div className="order-table-wrapper">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="order-empty-state">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>
                      <td>
                        <div className="order-customer-info">
                          <div className="order-customer-name">{order.user?.fullName}</div>
                          <div className="order-customer-email">{order.user?.email}</div>
                        </div>
                      </td>
                      <td>
                        <strong>Rs. {order.totalAmount}</strong>
                      </td>
                      <td>
                        <span 
                          className="order-status-badge"
                          style={{ background: getStatusColor(order.status) }}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="order-actions">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="order-view-btn"
                          >
                            <Eye style={{ width: '14px', height: '14px' }} />
                            View
                          </button>
                          
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="order-status-select"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="order-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="order-pagination-btn"
            >
              Previous
            </button>
            <span className="order-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="order-pagination-btn"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Details Modal - Same as admin version */}
        {showOrderDetails && selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setShowOrderDetails(false)}>
            <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="order-modal-header">
                <div className="order-modal-header-left">
                  {/* Book Image */}
                  <div className="order-modal-book-image">
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      <img 
                        src={getImageUrl(selectedOrder.orderItems[0].book?.image || selectedOrder.orderItems[0].book?.bookImage)} 
                        alt={selectedOrder.orderItems[0].book?.title || 'Book'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {(!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) && (
                      <div className="order-modal-book-placeholder">
                        <div className="order-modal-book-line"></div>
                        <div className="order-modal-book-line"></div>
                        <div className="order-modal-book-line"></div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="order-modal-title">📋 Order Details</h2>
                    <div className="order-modal-order-number">
                      Order #{selectedOrder.orderNumber}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="order-modal-close-btn"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="order-modal-body">
                {/* Order Summary */}
                <div className="order-summary-card">
                  <div className="order-summary-grid">
                    <div>
                      <div className="order-summary-label">ORDER DATE</div>
                      <div className="order-summary-value">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="order-summary-label">STATUS</div>
                      <span 
                        className="order-status-badge"
                        style={{ background: getStatusColor(selectedOrder.status) }}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <div className="order-summary-label">TOTAL AMOUNT</div>
                      <div className="order-summary-total">Rs. {selectedOrder.totalAmount}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="order-section">
                  <h3 className="order-section-title">👤 Customer Information</h3>
                  <div className="order-info-card">
                    <div className="order-info-grid">
                      <div>
                        <div className="order-info-label">NAME</div>
                        <div className="order-info-value">{selectedOrder.user?.fullName}</div>
                      </div>
                      <div>
                        <div className="order-info-label">EMAIL</div>
                        <div className="order-info-value">{selectedOrder.user?.email}</div>
                      </div>
                      <div>
                        <div className="order-info-label">PHONE</div>
                        <div className="order-info-value">{selectedOrder.deliveryPhone}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="order-info-label">DELIVERY ADDRESS</div>
                        <div className="order-info-value">{selectedOrder.deliveryAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-section">
                  <h3 className="order-section-title">
                    📚 Order Items ({selectedOrder.orderItems?.length || 0})
                  </h3>
                  <div className="order-items-list">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="order-item-card">
                        <div className="order-item-content">
                          {/* Book Image */}
                          <div className="order-item-image">
                            <img 
                              src={getImageUrl(item.book?.image || item.book?.bookImage)} 
                              alt={item.book?.title}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100x120/f3f4f6/9ca3af?text=No+Image';
                              }}
                            />
                          </div>
                          
                          {/* Book Details */}
                          <div className="order-item-details">
                            <div className="order-item-title">{item.book?.title}</div>
                            <div className="order-item-author">by {item.book?.author}</div>
                            
                            <div className="order-item-footer">
                              <div className="order-item-quantity">Qty: {item.quantity}</div>
                              <div className="order-item-price">Rs. {item.unitPrice}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="order-modal-footer">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="order-modal-close-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Modal */}
        {showSuccessModal && (
          <div className="order-modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="order-success-modal" onClick={(e) => e.stopPropagation()}>
              <div className={`order-success-header ${successMessage.includes('successfully') ? 'success' : 'error'}`}>
                <div className="order-success-icon-wrapper">
                  {successMessage.includes('successfully') ? (
                    <CheckCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  ) : (
                    <AlertCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  )}
                </div>
                <div>
                  <h3>{successMessage.includes('successfully') ? 'Success!' : 'Error'}</h3>
                  <p>{successMessage.includes('successfully') ? 'Operation completed' : 'Something went wrong'}</p>
                </div>
              </div>
              <div className="order-success-body">
                <p>{successMessage}</p>
              </div>
              <div className="order-success-footer">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className={`order-success-ok-btn ${successMessage.includes('successfully') ? 'success' : 'error'}`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Order;

