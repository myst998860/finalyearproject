import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, 
  Search, 
  Trash2,
  DollarSign,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getAllBooks, deleteBook } from '../services/api.js';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import React from 'react';
import './Books.css';

export default function AdminBooks() {
  // Add authentication redirect hook
  useAuthRedirect();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(6);
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
    type: 'success'
  });
  const queryClient = useQueryClient();

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['admin-books'],
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-books']);
      showNotification('Book deleted successfully', 'success');
    },
    onError: (error) => {
      showNotification('Failed to delete book: ' + error.message, 'error');
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
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const categories = [...new Set(books?.map(book => book.category).filter(Boolean) || [])];
  const statuses = [...new Set(books?.map(book => book.status).filter(Boolean) || [])];

  const handleDeleteBook = (bookId, bookTitle) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Delete Book',
      message: `Are you sure you want to delete "${bookTitle}"? This action cannot be undone and will remove the book from the platform.`,
      type: 'danger',
      onConfirm: () => deleteBookMutation.mutate(bookId),
      icon: Trash2
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  };

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
          <div className="error-title">Error loading </div>
          <div className="error-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="books-container">
      {/* Header */}
      <div className="books-header">
        <h1 className="books-title"> Management</h1>
        <p className="books-subtitle">Manage all books on the BookBridge platform</p>
      </div>

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

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' && <CheckCircle className="notification-icon" />}
          {notification.type === 'error' && <AlertCircle className="notification-icon" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
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
 