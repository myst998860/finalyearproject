import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './HomePage.css';
import { fetchBooks, getImageUrl } from '../services/api';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12); // Show 12 books per page
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const categories = [
    'All Products',
    'Blankets',
    'Toys',
    'Accessories',
    'Home Decor',
    'Baby Items'
  ];

  const priceRanges = [
    { label: 'Under $20', value: 'under-20' },
    { label: '$20 - $40', value: '20-40' },
    { label: '$40 - $60', value: '40-60' },
    { label: 'Over $60', value: 'over-60' }
  ];

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data);
      } catch (error) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (book) => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to add items to your cart.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own book
    const currentUser = JSON.parse(user);
    const isOwnBook = book.user && (book.user.id === currentUser.userId || book.userId === currentUser.userId);
    
    if (isOwnBook) {
      toast.warning('You cannot purchase your own book!');
      return;
    }

    addToCart(book);
    toast.success('Book added to cart!');
    navigate('/cart');
  };

  return (
    <div className="shop-page">
      <Navbar />
      <main className="shop-main-container">
        {/* Breadcrumbs */}
        <div className="shop-breadcrumbs">
          <span className="breadcrumb-icon">🏠</span>
          <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">Shop</span>
        </div>

        {/* Page Title and Subtitle */}
        <div className="shop-page-header">
          <h1 className="shop-page-title">Our Collection</h1>
          <p className="shop-page-subtitle">Discover beautiful handcrafted crochet items</p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="shop-content-wrapper">
          {/* Left Sidebar - Categories */}
          <aside className="shop-sidebar">
            <div className="sidebar-categories-card">
              <h2 className="sidebar-categories-title">Categories</h2>
              <ul className="sidebar-categories-list">
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`sidebar-category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter */}
            <div className="sidebar-price-range-card">
              <h2 className="sidebar-categories-title">Price Range</h2>
              <ul className="sidebar-price-range-list">
                {priceRanges.map((range) => (
                  <li key={range.value} className="sidebar-price-range-item">
                    <label className="price-range-label">
                      <input
                        type="checkbox"
                        checked={selectedPriceRange.includes(range.value)}
                        onChange={() => handlePriceRangeChange(range.value)}
                        className="price-range-checkbox"
                      />
                      <span>{range.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="shop-main-content">
            {/* Filter Bar with Product Count and Sort */}
            <div className="shop-filter-bar">
              <div className="shop-products-count">
                Showing {currentBooks.length} products
              </div>
              <div className="shop-filter-controls">
                <div className="sort-by-dropdown">
                  <span>Sort by: </span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="Featured">Featured</option>
                    <option value="Price Low to High">Price Low to High</option>
                    <option value="Price High to Low">Price High to Low</option>
                    <option value="Newest">Newest</option>
                  </select>
                </div>
                <div className="view-mode-toggle">
                  <button 
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button 
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Book Grid */}
            <div className={`book-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {loading ? (
            <div>Loading...</div>
          ) : books.length === 0 ? (
            <div>No match found.</div>
          ) : (
            currentBooks.map((book, idx) => {
              // Check if current user owns this book
              const user = localStorage.getItem('user');
              const currentUser = user ? JSON.parse(user) : null;
              const isOwnBook = currentUser && book.user && (book.user.id === currentUser.userId || book.userId === currentUser.userId);
              
              // Generate random badges for demo (you can replace with actual data)
              const badges = [];
              if (idx % 3 === 0) badges.push('New');
              if (idx % 4 === 0) badges.push('Sale');
              
              // Generate random rating for demo
              const rating = (4 + Math.random()).toFixed(1);
              const reviewCount = Math.floor(Math.random() * 30) + 10;
              
              return (
                <div className="book-card" key={book.id || idx}>
                  <div className="product-image-container">
                    <img
                      src={getImageUrl(book.bookImage)}
                      alt={book.title}
                      className="book-image"
                    />
                    {badges.length > 0 && (
                      <div className="product-badges">
                        {badges.includes('New') && <span className="badge badge-new">New</span>}
                        {badges.includes('Sale') && <span className="badge badge-sale">Sale</span>}
                      </div>
                    )}
                  </div>
                  <h3>{book.title}</h3>
                  <div className="product-rating">
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= Math.floor(rating) ? 'filled' : ''} ${star === Math.ceil(rating) && rating % 1 !== 0 ? 'half' : ''}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="review-count">({reviewCount})</span>
                  </div>
                  <p className="price">NRP. {book.price}/-</p>
                  
                  {/* Show warning if user owns the book */}
                  {isOwnBook && (
                    <div style={{
                      background: '#fff3cd',
                      color: '#856404',
                      padding: '5px',
                      borderRadius: '3px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      Your book
                    </div>
                  )}
                  
                  <button 
                    className="details-button"
                    onClick={() => navigate('/view-details', { state: { book } })}
                    disabled={isOwnBook}
                    style={{
                      opacity: isOwnBook ? 0.5 : 1,
                      cursor: isOwnBook ? 'not-allowed' : 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })
          )}
            </div>

            {/* Pagination Controls */}
            {!loading && books.length > 0 && totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                margin: '40px 0',
                padding: '20px'
              }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                background: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
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
                    onClick={() => handlePageChange(pageNumber)}
                    style={{
                      padding: '10px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: isCurrentPage ? '#ec4899' : 'white',
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                background: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Next
            </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;