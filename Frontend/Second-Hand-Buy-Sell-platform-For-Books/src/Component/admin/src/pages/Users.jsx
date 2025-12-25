import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Shield,
  ShieldOff,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getAllUsers, blockUser, unblockUser, deleteUser } from '../services/api.js';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import React from 'react';
import './Users.css';

export default function AdminUsers() {
  // Add authentication redirect hook
  useAuthRedirect();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
    icon: null
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // success, error, warning
  });
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users', currentPage, usersPerPage],
    queryFn: () => getAllUsers(currentPage - 1, usersPerPage), // Convert to 0-based index
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const blockUserMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users', currentPage, usersPerPage]);
      showNotification('User blocked successfully', 'success');
    },
    onError: (error) => {
      showNotification('Failed to block user: ' + error.message, 'error');
    }
  });

  const unblockUserMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users', currentPage, usersPerPage]);
      showNotification('User unblocked successfully', 'success');
    },
    onError: (error) => {
      showNotification('Failed to unblock user: ' + error.message, 'error');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users', currentPage, usersPerPage]);
      showNotification('User deleted successfully', 'success');
    },
    onError: (error) => {
      showNotification('Failed to delete user: ' + error.message, 'error');
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  }) || [];

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleBlockUser = (userId, userName) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Block User',
      message: `Are you sure you want to block ${userName}? They will not be able to access the platform until unblocked.`,
      type: 'warning',
      onConfirm: () => blockUserMutation.mutate(userId),
      icon: ShieldOff
    });
  };

  const handleUnblockUser = (userId, userName) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Unblock User',
      message: `Are you sure you want to unblock ${userName}? They will regain access to the platform.`,
      type: 'info',
      onConfirm: () => unblockUserMutation.mutate(userId),
      icon: Shield
    });
  };

  const handleDeleteUser = (userId, userName) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${userName}? This action cannot be undone and will remove all their data.`,
      type: 'danger',
      onConfirm: () => deleteUserMutation.mutate(userId),
      icon: Trash2
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: '12px', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <XCircle size={24} color="#dc2626" />
        <div style={{ color: '#991b1b' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Error loading users</div>
          <div style={{ fontSize: '14px' }}>{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          User Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage all users on the BookBridge platform
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
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
              <Users style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {users?.length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
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
              <Shield style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {users?.filter(u => u.status === 'ACTIVE').length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Users</div>
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
              <ShieldOff style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {users?.filter(u => u.status === 'BLOCKED').length || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Blocked Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
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
              background: 'white',
              outline: 'none'
            }}
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  User
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Contact
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Joined
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="user-table-row"
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#dbeafe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#3b82f6'
                      }}>
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {user.fullName || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {user.userType || 'USER'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '4px' }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {user.phone || 'No phone'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span 
                      className="status-badge"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                        color: user.status === 'ACTIVE' ? '#166534' : '#991b1b',
                        display: 'inline-block',
                        border: `1px solid ${user.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`
                      }}
                    >
                      {user.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#1f2937' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(user.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBlockUser(user.id, user.fullName)}
                          className="action-button"
                          style={{
                            padding: '8px 12px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#991b1b',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Block User"
                        >
                          <ShieldOff style={{ width: '14px', height: '14px' }} />
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockUser(user.id, user.fullName)}
                          className="action-button"
                          style={{
                            padding: '8px 12px',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            color: '#166534',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Unblock User"
                        >
                          <Shield style={{ width: '14px', height: '14px' }} />
                          Unblock
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        className="action-button"
                        style={{
                          padding: '8px 12px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          color: '#991b1b',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Delete User"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            No users found matching your criteria
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Previous
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: isCurrentPage ? '#3b82f6' : 'white',
                      color: isCurrentPage ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isCurrentPage ? '600' : '400'
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {notification.show && (
        <div 
          className="notification-enter"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: notification.type === 'success' ? '#d1fae5' : notification.type === 'error' ? '#fee2e2' : '#fef3c7',
            color: notification.type === 'success' ? '#065f46' : notification.type === 'error' ? '#991b1b' : '#92400e',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            minWidth: '300px',
            border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : notification.type === 'error' ? '#fecaca' : '#fde68a'}`
          }}
        >
          {notification.type === 'success' && <CheckCircle size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'warning' && <AlertCircle size={20} />}
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
              {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Warning'}
            </div>
            <div style={{ fontSize: '13px' }}>{notification.message}</div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmationDialog}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type={confirmationDialog.type}
        icon={confirmationDialog.icon}
      />
    </div>
  );
} 
 