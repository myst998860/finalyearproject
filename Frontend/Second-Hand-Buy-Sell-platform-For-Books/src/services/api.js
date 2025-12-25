// api.js
const BASE_URL = 'http://localhost:8082/api';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const userData = localStorage.getItem('user');
  const token = userData ? JSON.parse(userData).token : null;
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

const handleResponse = async (response) => {
  // Check if response has content
  const text = await response.text();
  
  // If response is empty or not JSON, throw a meaningful error
  if (!text || text.trim() === '') {
    throw new Error(`Server returned empty response (Status: ${response.status})`);
  }
  
  // Try to parse JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    console.error('Response text:', text);
    throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
  }
  
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      // Redirect to login page for admin routes
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return data;
};

export const login = async (email, password) => {
  console.log('Attempting login with email:', email);
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('Fetch response status:', response.status);
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// ✅ NEW: Register function
export const register = async (accountType, formData) => {
  try {
    console.log('Attempting registration for:', accountType);
    console.log('FormData contents:', Array.from(formData.entries()));
    
    const response = await fetch(`${BASE_URL}/register/${accountType}`, {
      method: 'POST',
      body: formData, // FormData includes the file and all fields
    });
    
    console.log('Registration response status:', response.status);
    console.log('Registration response headers:', response.headers);
    
    return handleResponse(response);
  } catch (error) {
    console.error('Registration API error:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Password reset (send verification link/code to email)
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Password reset API error:', error);
    throw error;
  }
};

// Fetch all books
export const fetchBooks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/books`);
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch books API error:', error);
    throw error;
  }
};

// Add a new book (with optional image upload)
export const addBook = async (bookData) => {
  try {
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : null;
    const response = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      body: bookData,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Add book API error:', error);
    throw error;
  }
};

export const fetchBooksByUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/books/my-books`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch books by user API error:', error);
    throw error;
  }
};

export const deleteBook = async (bookId, token) => {
  const response = await fetch(`${BASE_URL}/books/${bookId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete book');
  }
  return true;
};

export const updateBook = async (bookId, bookData, token) => {
  const response = await fetch(`${BASE_URL}/books/${bookId}`, {
    method: 'PUT',
    body: bookData,
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to update book');
  }
  return response.json();
};

// ========== CART API FUNCTIONS ==========

// Get user's cart items
export const getCartItems = async () => {
  try {
    const response = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get cart items API error:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (bookId, quantity = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, quantity }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Add to cart API error:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/update/${cartItemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update cart item API error:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/remove/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Remove from cart API error:', error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await fetch(`${BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Clear cart API error:', error);
    throw error;
  }
};

// ========== ORDER API FUNCTIONS ==========

// Create order from cart
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Create order API error:', error);
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${BASE_URL}/orders?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get user orders API error:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get order API error:', error);
    throw error;
  }
};

// ========== PAYMENT API FUNCTIONS ==========

// Initiate eSewa payment
export const initiateEsewaPayment = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/esewa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Initiate eSewa payment API error:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentId) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/verify?paymentId=${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Verify payment API error:', error);
    throw error;
  }
};

// Get payment by order
export const getPaymentByOrder = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/order/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get payment by order API error:', error);
    throw error;
  }
};

// Legacy payment functions (keeping for backward compatibility)
export const initiatePayment = async (orderId, amount) => {
  return initiateEsewaPayment(orderId);
};

// Download order PDF
export const downloadOrderPDF = async (orderId) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}/pdf`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Download PDF API error:', error);
    throw error;
  }
};

// Test authentication
export const testAuthentication = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payments/test-auth`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Test authentication API error:', error);
    throw error;
  }
};

// Check order payment status
export const checkOrderPaymentStatus = async (orderId) => {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/payment-status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check payment status');
  }
  
  return response.json();
};

// Admin API Functions
export const adminLogin = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
      credentials: 'include' // Include cookies for session-based auth
    });
    
    // Handle specific HTTP status codes
    if (response.status === 403) {
      throw new Error('Access denied. Invalid credentials or insufficient permissions.');
    } else if (response.status === 401) {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (response.status === 404) {
      throw new Error('Admin login endpoint not found. Please contact support.');
    } else if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    return handleResponse(response);
  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

export const isAdminAuthenticated = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/test-auth`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const blockUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Block user error:', error);
    throw error;
  }
};

export const unblockUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/unblock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Unblock user error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const getAllBooks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/books`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get books error:', error);
    throw error;
  }
};

export const deleteAdminBook = async (bookId) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/books/${bookId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete book');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete book error:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/orders`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

export const logUpworkTransaction = async (transactionData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/upwork-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to log transaction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Log transaction error:', error);
    throw error;
  }
};

export const getUpworkTransactions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/upwork-transactions`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
};

// Analytics API functions
export const getOrderAnalytics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/orders`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get order analytics error:', error);
    throw error;
  }
};

export const getPaymentAnalytics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/payments`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get payment analytics error:', error);
    throw error;
  }
};

export const getBusinessAnalytics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/business`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch business analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get business analytics error:', error);
    throw error;
  }
};

// Download analytics PDF report
export const downloadAnalyticsPDF = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/pdf`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download analytics PDF');
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
  } catch (error) {
    console.error('Download analytics PDF API error:', error);
    throw error;
  }
};

export const updateUpworkTransactionStatus = async (transactionId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/upwork-transactions/${transactionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update transaction status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update transaction status error:', error);
    throw error;
  }
};
