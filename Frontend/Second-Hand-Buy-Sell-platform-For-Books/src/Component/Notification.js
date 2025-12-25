import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './HomePage.css';
import { getAuthHeaders } from '../services/api';
import { toast } from 'react-toastify';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.token || !parsedUser.email) {
        localStorage.removeItem('user');
        return null;
      }
      
      return parsedUser;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) {
        setUnreadNotificationCount(0);
        return;
      }
      
      const response = await fetch('http://localhost:8082/api/notifications/count', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.unreadCount || 0);
      } else if (response.status === 401) {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setUnreadNotificationCount(0);
    }
  }, [user]);

  // Load all notifications
  const loadAllNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/api/notifications', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.content || []);
      }
    } catch (error) {
      console.error('Error loading all notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        // Refresh notification count and list
        loadNotifications();
        loadAllNotifications();
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/notifications/read-all', {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        loadNotifications();
        loadAllNotifications();
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  useEffect(() => {
    if (user && user.token) {
      loadNotifications();
      loadAllNotifications();
    }
  }, [user, loadNotifications, loadAllNotifications]);

  // Load notifications periodically
  useEffect(() => {
    if (user && user.token) {
      const interval = setInterval(() => {
        loadNotifications();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
          <h2>Please log in to view notifications</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#333' }}>Your Notifications</h2>
          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Mark All as Read
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <div style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>No notifications yet</div>
            <div style={{ color: '#888', fontSize: 14 }}>
              You'll see notifications here when someone orders your books or when there are important updates.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(notification => (
              <div key={notification.id} style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 16,
                background: notification.isRead ? '#f8f9fa' : '#fff',
                borderLeft: notification.isRead ? '4px solid #6c757d' : '4px solid #007bff',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 16, fontWeight: 600 }}>
                      {notification.title}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14, lineHeight: 1.5 }}>
                      {notification.message}
                    </p>
                    <p style={{ margin: 0, color: '#999', fontSize: 12 }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginLeft: 12
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notification; 