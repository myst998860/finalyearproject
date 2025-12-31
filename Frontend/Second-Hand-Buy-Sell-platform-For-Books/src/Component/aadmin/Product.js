import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Trash2,
  DollarSign,
  Calendar,
  Tag,
  XCircle
} from 'lucide-react';
import { getAuthHeaders } from '../../services/api';
import { toast } from 'react-toastify';
import { showDeleteConfirmation, showLogoutConfirmation } from '../ConfirmationToast';
import './Product.css';

const Product = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(6);
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

  // Fetch books with organization token
  const fetchBooks = async () => {
    const headers = getAuthHeaders();
    const response = await fetch('http://localhost:8082/api/admin/books', {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        throw new Error('Authentication failed');
      }
      throw new Error('Failed to fetch books');
    }
    
    return response.json();
  };

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['organization-books'],
    queryFn: fetchBooks,
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

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId) => {
      const headers = getAuthHeaders();
      const response = await fetch(`http://localhost:8082/api/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete book');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-books']);
      toast.success('Book deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete book: ' + error.message);
    }
  });

  const filteredBooks = books?.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus.toUpperCase();
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const categories = [...new Set(books?.map(book => book.category).filter(Boolean) || [])];
  const statuses = [...new Set(books?.map(book => book.status).filter(Boolean) || [])];

  const handleDeleteBook = (bookId, bookTitle) => {
    showDeleteConfirmation(bookTitle, () => {
      deleteBookMutation.mutate(bookId);
    });
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <XCircle size={24} color="#dc2626" />
        <div className="error-text">
          <div className="error-title">Error loading books</div>
          <div className="error-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="books-container">
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
              Product Management
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Manage all books on the BookBridge platform
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

      {/* Content */}
      <div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <BookOpen style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <div>
              <div className="stat-value">{books?.length || 0}</div>
              <div className="stat-label">Total Books</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: '#dcfce7' }}>
              <Tag style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <div>
              <div className="stat-value">{books?.filter(b => b.status === 'AVAILABLE').length || 0}</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <DollarSign style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <div>
              <div className="stat-value">Rs. {books?.reduce((sum, book) => sum + (book.price || 0), 0) || 0}</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
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
              placeholder="Search books by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-grid-container">
        <div className="books-grid-header">
          <h3 className="books-grid-title">Books ({filteredBooks.length})
            {totalPages > 1 && (
              <span className="books-grid-page-info">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </h3>
        </div>

        <div className="books-grid-content">
          <div className="books-grid">
            {currentBooks.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="book-icon-container">
                      <BookOpen className="book-icon" />
                    </div>
                    <div>
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">by {book.author}</p>
                    </div>
                  </div>
                  
                  <div className="book-actions">
                    <button
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      className="delete-button"
                      title="Delete Book"
                    >
                      <Trash2 className="delete-icon" />
                    </button>
                  </div>
                </div>

                <div className="book-details">
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">Rs. {book.price || 0}/-</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{book.category || 'Unknown'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Condition:</span>
                    <span className="detail-value">{book.condition || 'Unknown'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">ISBN:</span>
                    <span className="detail-value">{book.isbn || 'N/A'}</span>
                  </div>
                </div>

                <div className="book-status-info">
                  <span className={`status-badge ${book.status === 'AVAILABLE' ? 'available' : 'unavailable'}`}>
                    {book.status || 'UNKNOWN'}
                  </span>
                  
                  <div className="status-meta">
                    <Calendar className="status-icon" />
                    {new Date(book.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {book.description && (
                  <div className="book-description">
                    <p>
                      {book.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="no-books-message">
              No books found matching your criteria
            </div>
          )}

          {/* Pagination */}
          {filteredBooks.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`pagination-number-button ${isCurrentPage ? 'active' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Product;

