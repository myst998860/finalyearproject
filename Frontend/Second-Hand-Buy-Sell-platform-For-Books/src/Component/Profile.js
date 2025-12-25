import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './HomePage.css';
import { fetchBooksByUser, deleteBook, updateBook, getUserOrders, downloadOrderPDF, testAuthentication } from '../services/api';
import { toast } from 'react-toastify';
import { showDeleteConfirmation } from './ConfirmationToast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      const parsedUser = JSON.parse(userData);
      // Check if user has required fields
      if (!parsedUser.token || !parsedUser.email) {
        console.log('Invalid user data found, clearing...');
        localStorage.removeItem('user');
        return null;
      }
      
      return parsedUser;
    } catch (e) {
      console.log('Error parsing user data, clearing...');
      localStorage.removeItem('user');
      return null;
    }
  });

  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  
  // Order history state
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const navigate = useNavigate();

  // Function to clear user data and redirect to login
  const clearUserAndRedirect = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Please log in to continue');
    navigate('/login');
  }, [navigate]);

  // Get status badge color
  const getBookStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#28a745'; // Green
      case 'RESERVED':
        return '#ffc107'; // Yellow/Orange
      case 'SOLD':
        return '#dc3545'; // Red
      case 'EXCHANGED':
        return '#17a2b8'; // Blue
      case 'DONATED':
        return '#6f42c1'; // Purple
      default:
        return '#6c757d'; // Gray
    }
  };

  // Get status display text
  const getBookStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'RESERVED':
        return 'Ordered';
      case 'SOLD':
        return 'Sold';
      case 'EXCHANGED':
        return 'Exchanged';
      case 'DONATED':
        return 'Donated';
      default:
        return status;
    }
  };

  // Load user's books
    const loadBooks = useCallback(async () => {
    try {
        setLoading(true);
      const token = user?.token;
      
      if (!token) {
        console.log('No token found - user not logged in');
        setUserBooks([]);
        return;
      }
      
      const books = await fetchBooksByUser();
          setUserBooks(books);
    } catch (err) {
      console.error('Error loading books:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        clearUserAndRedirect();
        return;
      } else {
        toast.error('Failed to load books');
      }
          setUserBooks([]);
        } finally {
          setLoading(false);
      }
    }, [user, clearUserAndRedirect]);
    
  // Load user's orders
    const loadOrders = useCallback(async () => {
    try {
        setOrdersLoading(true);
      const token = user?.token;
      
      console.log('Loading orders for user:', user?.email);
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      
      if (!token) {
        console.log('No token found - user not logged in');
        setUserOrders([]);
        return;
      }
      
          const orders = await getUserOrders();
      console.log('Orders loaded:', orders);
      setUserOrders(orders); // orders is now the full paginated response object
    } catch (err) {
      console.error('Error loading orders:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        clearUserAndRedirect();
        return;
      } else {
        toast.error('Failed to load orders');
      }
          setUserOrders([]);
        } finally {
          setOrdersLoading(false);
        }
  }, [user, clearUserAndRedirect]);

  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'orders'

  useEffect(() => {
    if (user && user.token) {
      console.log('User authenticated, loading data...');
    loadBooks();
    loadOrders();
    } else {
      console.log('User not logged in, skipping data load');
    }
  }, [user, loadBooks, loadOrders]);



  // Perform the actual delete operation
  const performDelete = async (bookId) => {
    try {
      const token = user?.token;
      await deleteBook(bookId, token);
      setUserBooks(userBooks.filter(b => b.id !== bookId));
      toast.success('Book deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete book: ' + err.message);
    }
  };

  // Delete handler using reusable confirmation
  const handleDelete = (bookId, bookTitle) => {
    showDeleteConfirmation(bookTitle, () => performDelete(bookId));
  };

  // Edit handlers
  const openEditModal = (book) => {
    setEditBook(book);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      price: book.price || '',
      condition: book.condition || '',
      category: book.category || '',
      location: book.location || '',
      isbn: book.isbn || '',
      edition: book.edition || '',
      listingType: book.listingType || '',
    });
    setEditImagePreview(book.bookImage && book.bookImage.startsWith('http') ? book.bookImage : (book.bookImage ? `http://localhost:8082/${book.bookImage.replace(/^\/?/, '')}` : book.imageUrl || 'https://via.placeholder.com/120x120?text=No+Image'));
    setEditImageFile(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditBook(null);
    setEditForm({});
    setEditImagePreview(null);
    setEditImageFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle PDF download for orders
  const handleDownloadPDF = async (orderId) => {
    try {
      await downloadOrderPDF(orderId);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF: ' + error.message);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'confirmed':
        return '#28a745';
      case 'shipped':
        return '#17a2b8';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editBook) return;
    try {
      const token = user?.token;
      const data = new FormData();
      Object.entries(editForm).forEach(([key, value]) => data.append(key, value));
      if (editImageFile) {
        data.append('bookImage', editImageFile);
      }
      await updateBook(editBook.id, data, token);
      
      // Reload the user's books to get the latest data
      await loadBooks();
      toast.success('Book updated successfully!');
      closeEditModal();
    } catch (err) {
      toast.error('Failed to update book: ' + err.message);
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    console.log('Refreshing orders...');
    
    // Debug authentication
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      console.log('Token exists:', !!parsedUser.token);
      console.log('Token length:', parsedUser.token ? parsedUser.token.length : 0);
    }
    
    // Test authentication first
    const isAuthenticated = await testAuthentication();
    console.log('Authentication test result:', isAuthenticated);
    
    if (user && user.userId && isAuthenticated) {
      setOrdersLoading(true);
      try {
        console.log('Loading orders for user:', user.userId);
        const orders = await getUserOrders();
        console.log('Orders response:', orders);
        setUserOrders(orders.content || orders);
        console.log('Set user orders:', orders.content || orders);
      } catch (e) {
        console.error('Error loading orders:', e);
        setUserOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    } else {
      console.log('No user, userId, or authentication failed:', { user, isAuthenticated });
      if (!isAuthenticated) {
        console.log('Authentication failed - token may be invalid or expired');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 400, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>User Profile</h2>
        {user ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>👤</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{user.name || user.fullName || user.email}</div>
            {user.email && <div style={{ color: '#888', marginBottom: 16 }}>{user.email}</div>}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#d32f2f' }}>
            <p>You are not logged in.</p>
            <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>Login</a>
          </div>
        )}
      </div>
      {/* Tabbed Content */}
      {user && (
        <div style={{ maxWidth: 1000, margin: '32px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', marginBottom: 20, borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => setActiveTab('books')}
              style={{
                background: activeTab === 'books' ? '#28a745' : 'transparent',
                color: activeTab === 'books' ? '#fff' : '#333',
                border: 'none',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderBottom: activeTab === 'books' ? '2px solid #28a745' : 'none'
              }}
            >
              My Books ({userBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                background: activeTab === 'orders' ? '#28a745' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : '#333',
                border: 'none',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderBottom: activeTab === 'orders' ? '2px solid #28a745' : 'none'
              }}
            >
              Order History ({userOrders?.content?.length || 0})
            </button>

          </div>

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Books You've Listed</h3>
              {loading ? (
                <div>Loading your books...</div>
              ) : userBooks.length === 0 ? (
                <div style={{ color: '#888' }}>You haven't listed any books yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                  {userBooks.map((book) => (
                      <div key={book.id} style={{
                      border: '1px solid #e0e0e0',
                        borderRadius: 12,
                        padding: 20,
                        background: '#fafbfc',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}>
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: getBookStatusColor(book.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {getBookStatusText(book.status)}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 120, height: 160, flexShrink: 0 }}>
                          {book.bookImage ? (
                        <img
                              src={book.bookImage}
                          alt={book.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 8
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: '#f0f0f0',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#666'
                            }}>
                              No Image
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{book.title}</h4>
                          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
                            <strong>Author:</strong> {book.author}
                          </p>
                          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
                            <strong>Description:</strong> {book.description || 'No description available'}
                          </p>
                          <p style={{ margin: '0 0 8px 0', color: '#28a745', fontSize: 16, fontWeight: 'bold' }}>
                            Rs. {book.price}
                          </p>
                          
                          <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openEditModal(book)}
                              style={{
                                background: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              Edit
                            </button>
                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              Delete
                            </button>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Your Order History</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={refreshOrders}
                    style={{
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              {ordersLoading ? (
                <div>Loading your orders...</div>
              ) : !userOrders?.content || userOrders.content.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                  <div style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>You haven't placed any orders yet.</div>
                  <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                    To see orders here, you need to buy books from other users.
                  </div>
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '16px', 
                    borderRadius: 8, 
                    border: '1px solid #e9ecef',
                    marginBottom: 20
                  }}>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: 8 }}>How to place an order:</div>
                    <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                      1. Browse books in the BookStore<br/>
                      2. Add books to your cart<br/>
                      3. Go to checkout and complete your purchase<br/>
                      4. Your orders will appear here
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    style={{
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    🛒 Browse Books
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(userOrders.content || []).map(order => (
                    <div key={order.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 12,
                      padding: 20,
                      background: '#fafbfc',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Order #{order.orderNumber}</h4>
                          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
                            Placed on: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
                            Total: Rs. {order.totalAmount}/-
                          </p>
                          {order.deliveryAddress && (
                            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
                              Address: {order.deliveryAddress}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <span style={{
                            background: getStatusColor(order.status),
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => handleDownloadPDF(order.id)}
                            style={{
                              background: '#007bff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            📄 Download PDF
                          </button>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      {order.orderItems && order.orderItems.length > 0 && (
                        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 16 }}>
                          <h5 style={{ margin: '0 0 12px 0', color: '#333' }}>Items:</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.orderItems.map((item, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#fff',
                                borderRadius: 6,
                                border: '1px solid #e9ecef'
                              }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#333' }}>
                                    {item.bookTitle || 'Book Title'}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>
                                    Qty: {item.quantity} × Rs. {item.unitPrice}/-
                                  </div>
                                </div>
                                <div style={{ fontWeight: 600, color: '#2E8B57' }}>
                                  Rs. {item.totalPrice}/-
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      )}
      {/* Edit Modal */}
      {editModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 0, 
            width: '100%', 
            maxWidth: 500, 
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)',
              color: 'white',
              padding: '20px 24px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>Edit Book</h3>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: 13 }}>Update your book information</p>
            </div>

            {/* Scrollable Content */}
            <div style={{ 
              maxHeight: 'calc(90vh - 140px)', 
              overflowY: 'auto', 
              padding: '24px'
            }}>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Image Section */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: 10,
                  border: '2px dashed #dee2e6'
                }}>
                  <img
                    src={editImagePreview}
                    alt="Book Preview"
                    style={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 8, 
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      marginBottom: 10
                    }}
                  />
                  <label htmlFor="edit-image-upload" style={{ 
                    cursor: 'pointer', 
                    color: '#2E8B57', 
                    fontWeight: 500, 
                    fontSize: 13,
                    padding: '6px 12px',
                    background: '#fff',
                    borderRadius: 6,
                    border: '1px solid #2E8B57',
                    transition: 'all 0.2s'
                  }}>
                    Change Image
                  </label>
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <p style={{ margin: '6px 0 0 0', fontSize: 11, color: '#6c757d', textAlign: 'center' }}>
                    Click to upload a new book cover
                  </p>
                </div>

                {/* Title Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Book Title
                  </label>
                  <input 
                    name="title" 
                    value={editForm.title} 
                    onChange={handleEditChange} 
                    placeholder="Enter book title" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required 
                  />
                </div>

                {/* Author Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Author
                  </label>
                  <input 
                    name="author" 
                    value={editForm.author} 
                    onChange={handleEditChange} 
                    placeholder="Enter author name" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required 
                  />
                </div>

                {/* Description Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleEditChange} 
                    placeholder="Describe your book..." 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      minHeight: 70,
                      resize: 'vertical',
                      transition: 'border-color 0.2s'
                    }} 
                    rows={3} 
                    required 
                  />
                </div>

                {/* Price Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Price (Rs.)
                  </label>
                  <input 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleEditChange} 
                    placeholder="Enter price" 
                    type="number" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required 
                  />
                </div>

                {/* Condition Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Condition
                  </label>
                  <select 
                    name="condition" 
                    value={editForm.condition} 
                    onChange={handleEditChange} 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required
                  >
                    <option value="">Select book condition</option>
                    <option value="EXCELLENT">Excellent - Like new</option>
                    <option value="GOOD">Good - Minor wear</option>
                    <option value="FAIR">Fair - Some damage</option>
                    <option value="POOR">Poor - Significant damage</option>
                  </select>
                </div>

                {/* Category Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Category
                  </label>
                  <select 
                    name="category" 
                    value={editForm.category} 
                    onChange={handleEditChange} 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required
                  >
                    <option value="">Select book category</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="FICTION">Fiction</option>
                    <option value="NONFICTION">Nonfiction</option>
                    <option value="SCIENCE">Science</option>
                    <option value="HISTORY">History</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Location Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Location
                  </label>
                  <input 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleEditChange} 
                    placeholder="Enter your location" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required 
                  />
                </div>

                {/* ISBN Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    ISBN (Optional)
                  </label>
                  <input 
                    name="isbn" 
                    value={editForm.isbn} 
                    onChange={handleEditChange} 
                    placeholder="Enter ISBN number" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                  />
                </div>

                {/* Edition Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Edition (Optional)
                  </label>
                  <input 
                    name="edition" 
                    value={editForm.edition} 
                    onChange={handleEditChange} 
                    placeholder="Enter edition" 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                  />
                </div>

                {/* Listing Type Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
                    Listing Type
                  </label>
                  <select 
                    name="listingType" 
                    value={editForm.listingType} 
                    onChange={handleEditChange} 
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: 8, 
                      border: '1px solid #ddd', 
                      fontSize: 14,
                      transition: 'border-color 0.2s'
                    }} 
                    required
                  >
                    <option value="">Select listing type</option>
                    <option value="SELL">Sell - Permanent sale</option>
                    <option value="RENT">Rent - Temporary rental</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: 10, 
                  justifyContent: 'flex-end', 
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #eee'
                }}>
                  <button 
                    type="button" 
                    onClick={closeEditModal} 
                    style={{ 
                      background: '#f8f9fa', 
                      color: '#6c757d', 
                      border: '1px solid #dee2e6', 
                      borderRadius: 8, 
                      padding: '10px 20px', 
                      fontWeight: 500, 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ 
                      background: '#2E8B57', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      padding: '10px 20px', 
                      fontWeight: 500, 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      transition: 'all 0.2s'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Profile; 