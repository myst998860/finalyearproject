import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../Component/assests/hand-keep-book-read-source-600nw-1127076767-removebg-preview.png';
import { showLogoutConfirmation } from './ConfirmationToast';

// Icons
const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#374151" strokeWidth="2" />
    <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const modalRef = useRef(null);
  const listBookRef = useRef(null);
  const orgDropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = storedUser.token || null;
    const type = storedUser.userType?.toLowerCase() || null;
    setIsLoggedIn(!!token);
    setUserType(type);

    const syncAcrossTabs = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setIsLoggedIn(!!updatedUser.token);
      setUserType(updatedUser.userType?.toLowerCase() || null);
    };

    window.addEventListener('storage', syncAcrossTabs);
    return () => window.removeEventListener('storage', syncAcrossTabs);
  }, []);

  // Load notification count when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadNotificationCount();
      
      // Refresh notification count every 30 seconds
      const interval = setInterval(() => {
        loadNotificationCount();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      setUnreadNotificationCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !listBookRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
        setOrgDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNavigation = (path) => {
    setIsModalOpen(false);
    setOrgDropdownOpen(false);
    setProfileDropdownOpen(false);
    navigate(path);
  };

  const performLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/');
  };

  const handleLogout = () => {
    showLogoutConfirmation(performLogout);
  };

  // Load notification count
  const loadNotificationCount = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = storedUser.token;
      
      if (!token) {
        setUnreadNotificationCount(0);
        return;
      }
      
      const response = await fetch('http://localhost:8082/api/notifications/count', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.unreadCount || 0);
      } else if (response.status === 401) {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
      setUnreadNotificationCount(0);
    }
  };

  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="navbar-left" onClick={() => handleNavigation('/')}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <img 
          src={logo} 
          alt="Book Bridge Logo" 
          className="logo" 
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <span className="brand-name">Book Bridge</span>
      </div>

      {/* Middle Navigation */}
      <ul className="nav-links">
        <li onClick={() => handleNavigation('/')} className={location.pathname === '/' ? 'active' : ''}>Home</li>
        <li onClick={() => handleNavigation('/about')} className={location.pathname === '/about' ? 'active' : ''}>About</li>
        <li onClick={() => handleNavigation('/search')} className={location.pathname === '/search' ? 'active' : ''}>BookStore</li>
        {isLoggedIn && userType === 'individual' && (
          <li ref={listBookRef} className="dropdown" onClick={() => setIsModalOpen(!isModalOpen)}>
            List a book <span className="arrow">▼</span>
            {isModalOpen && (
              <div ref={modalRef} className="list-book-dropdown">
                <div className="dropdown-left-panel" onClick={() => handleNavigation('/book-list')}>
                  <div className="panel-content">
                    <div className="panel-title">List your Book</div>
                    <p className="panel-description">Sell, exchange, or donate your books to fellow readers and organizations.</p>
                  </div>
                </div>
                <div className="dropdown-right-panel">
                  <div className="right-panel-item" onClick={() => handleNavigation('/book-sell')}>
                    <div className="right-panel-title">Sell a Book</div>
                    <div className="right-panel-subtitle">List your book for sale and earn money</div>
                  </div>
                  {/*
                  <div className="right-panel-item" onClick={() => handleNavigation('/book-exchange')}>
                    <div className="right-panel-title">Exchange a Book</div>
                    <div className="right-panel-subtitle">Swap your book for another one</div>
                  </div>
                  <div className="right-panel-item" onClick={() => handleNavigation('/book-donate')}>
                    <div className="right-panel-title">Donate a Book</div>
                    <div className="right-panel-subtitle">Donate your book to help others</div>
                  </div>
                  */}
                </div>
              </div>
            )}
          </li>
        )}
        {isLoggedIn && userType === 'organization' && (
          <li ref={orgDropdownRef} className="dropdown" onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}>
            <span>Organization <span className="arrow">▼</span></span>
            {orgDropdownOpen && (
              <div ref={orgDropdownRef} className="org-dropdown">
                <div className="dropdown-item" onClick={() => handleNavigation('/request-book')}>
                  Request Books
                </div>
              </div>
            )}
          </li>
        )}
      </ul>

      {/* Right Section */}
      <div className="navbar-right">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            placeholder="Search books..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => e.currentTarget.style.width = '250px'}
            onBlur={(e) => e.currentTarget.style.width = '200px'}
          />
        </form>
        <span className="icon" onClick={() => handleNavigation('/notification')} style={{ position: 'relative' }}>
          <NotificationIcon />
          {unreadNotificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: '#dc3545',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {unreadNotificationCount}
            </span>
          )}
        </span>
        <span className="icon" onClick={() => handleNavigation('/cart')}>
          <CartIcon />
        </span>
        {isLoggedIn && (
          <div ref={profileRef} className="dropdown" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
            <span className="icon">
              <UserProfileIcon />
            </span>
            {profileDropdownOpen && (
              <div ref={profileRef} className="list-book-dropdown">
                <div className="dropdown-item" onClick={() => handleNavigation('/profile')}>
                  Profile
                </div>
                {userType === 'admin' && (
                  <div className="dropdown-item" onClick={() => handleNavigation('/admin')}>
                    Admin Panel
                  </div>
                )}
                <div className="dropdown-item text-red-600" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <>
            <button className="login-btn" onClick={() => handleNavigation('/login')}>
              Login
            </button>
            <button className="signup-btn" onClick={() => handleNavigation('/registration')}>
              Join Us
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;