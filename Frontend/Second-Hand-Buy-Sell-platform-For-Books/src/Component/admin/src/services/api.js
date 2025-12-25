const BASE_URL = 'http://localhost:8082/api';

// Helper function to get auth headers with JWT token
const getAuthHeaders = () => {
  const adminData = localStorage.getItem('adminUser');
  const token = adminData ? JSON.parse(adminData).token : null;
  return token ? {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  } : { 'Content-Type': 'application/json' };
};

// Helper function to get image URL (handles both Cloudinary and local URLs)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local file path, construct the full URL
  return `${BASE_URL}/files/${imagePath}`;
};

// Admin Authentication
export const adminLogin = async (credentials) => {
  try {
    console.log('Attempting admin login with:', credentials.email);
    
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(credentials),
      credentials: 'include' // Include cookies for session-based auth
  });
    
    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers);
  
  if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error response:', errorText);
    throw new Error('Admin login failed');
  }
  
  const data = await response.json();
    console.log('Login successful:', data);
  return data;
  } catch (error) {
    console.error('Error in adminLogin:', error);
    throw error;
  }
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return response.json();
};

// Users Management
export const getAllUsers = async (page = 0, size = 10) => {
  try {
    console.log('Fetching users from:', `${BASE_URL}/admin/users?page=${page}&size=${size}`);
    
  const response = await fetch(`${BASE_URL}/admin/users?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
      credentials: 'include' // Include cookies for session-based auth
  });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
  
  if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }
  
    const data = await response.json();
    console.log('Users data received:', data);
    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

export const blockUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/block`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to block user');
  }
  
  return response.json();
};

export const unblockUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/unblock`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to unblock user');
  }
  
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return response.json();
};

// Books Management
export const getAllBooks = async () => {
  const response = await fetch(`${BASE_URL}/admin/books`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  
  return response.json();
};

export const deleteBook = async (bookId) => {
  const response = await fetch(`${BASE_URL}/admin/books/${bookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete book');
  }
  
  return response.json();
};

// Payments Management
export const getAllPayments = async (page = 0, size = 10) => {
  const response = await fetch(`${BASE_URL}/admin/payments?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }
  
  return response.json();
};

// Orders Management
export const getAllOrders = async () => {
  const response = await fetch(`${BASE_URL}/admin/orders`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  
  return response.json();
};

// Upwork Transactions
export const logUpworkTransaction = async (transactionData) => {
  const response = await fetch(`${BASE_URL}/admin/upwork`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to log upwork transaction');
  }
  
  return response.json();
};

export const getUpworkTransactions = async (page = 0, size = 10) => {
  const response = await fetch(`${BASE_URL}/admin/upwork?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch upwork transactions');
  }
  
  return response.json();
};

export const updateUpworkTransactionStatus = async (transactionId, status) => {
  const response = await fetch(`${BASE_URL}/admin/upwork/${transactionId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to update upwork transaction status');
  }
  
  return response.json();
};

// Analytics Functions
export const getOrderAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/admin/analytics/orders`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch order analytics');
  }
  
  return response.json();
};

export const getPaymentAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/admin/analytics/payments`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment analytics');
  }
  
  return response.json();
};

export const getBusinessAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/admin/analytics/business`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch business analytics');
  }
  
  return response.json();
};

export const downloadAnalyticsPDF = async () => {
  const response = await fetch(`${BASE_URL}/admin/analytics/pdf`, {
    headers: getAuthHeaders(),
    credentials: 'include' // Include cookies for session-based auth
  });
  
  if (!response.ok) {
    throw new Error('Failed to download analytics PDF');
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

// Check if admin is authenticated (synchronous check for route protection)
export const isAdminAuthenticated = () => {
  const adminData = localStorage.getItem('adminUser');
  return adminData !== null;
};

// Verify admin session with backend (async)
export const verifyAdminSession = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/test-auth`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await response.json();
    if (!data.authenticated) {
      localStorage.removeItem('adminUser');
    }
    return data.authenticated === true;
  } catch (error) {
    console.error('Admin auth check failed:', error);
    localStorage.removeItem('adminUser');
    return false;
  }
};

// Store admin session
export const setAdminSession = (adminData) => {
  localStorage.setItem('adminUser', JSON.stringify(adminData));
};

// Get admin session
export const getAdminSession = () => {
  const data = localStorage.getItem('adminUser');
  return data ? JSON.parse(data) : null;
};

// Logout admin
export const adminLogout = () => {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('adminToken');
}; 
 