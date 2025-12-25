import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { testAuthentication } from '../services/api';
import { toast } from 'react-toastify';

const TestEsewaPayment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('pending');
  const [orderDetails] = useState(state?.order || null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Test credentials state
  const [testCredentials, setTestCredentials] = useState({
    email: '',
    password: ''
  });
  const [paymentStep, setPaymentStep] = useState('credentials'); // 'credentials', 'processing', 'success'

  useEffect(() => {
    testAuth();
  }, []);

  const testAuth = async () => {
    try {
      setLoading(true);
      const result = await testAuthentication();
      setAuthStatus('success');
      toast.success('Authentication successful! Ready for payment.');
      console.log('Authentication successful:', result);
    } catch (error) {
      setAuthStatus('failed');
      toast.error('Authentication failed. Please try again.');
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateEsewaPayment = () => {
    // Validate credentials first
    if (!testCredentials.email || !testCredentials.password) {
      toast.error('Please enter both email and password for eSewa payment.');
      return;
    }
    
    // Check if credentials match test values
    if (testCredentials.email !== 'test@esewa.com.np' || testCredentials.password !== 'test123') {
      toast.error('Invalid credentials. Please use:\nEmail: test@esewa.com.np\nPassword: test123');
      return;
    }
    
    setPaymentStep('processing');
    setPaymentStatus('processing');
    toast.info('Processing payment with eSewa...');
    
    // Simulate eSewa payment process with multiple steps
    setTimeout(() => {
      setPaymentStep('success');
      setPaymentStatus('success');
      setShowPaymentModal(true);
      
      toast.success('Payment successful! Your order has been confirmed.');
      
      // After modal is shown, redirect to profile
      setTimeout(() => {
        setShowPaymentModal(false);
        navigate('/profile');
      }, 5000);
      
    }, 3000);
  };

  const handleBackToBilling = () => {
    navigate('/billing', { state: { cart: state?.cart, total: state?.total } });
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setTestCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    navigate('/profile');
  };

  return (
    <div className="test-payment-page">
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
        {/* eSewa Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: '#60BB46', 
            color: '#fff', 
            padding: '16px 24px', 
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#fff', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#60BB46'
            }}>
              ₹
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>eSewa Payment Gateway</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Secure Digital Payment</p>
            </div>
          </div>
          <h3 style={{ color: '#333', margin: 0 }}>Complete Your Payment</h3>
        </div>
        
        {/* Authentication Status */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          borderRadius: '8px',
          background: authStatus === 'success' ? '#d4edda' : authStatus === 'failed' ? '#f8d7da' : '#fff3cd',
          border: `1px solid ${authStatus === 'success' ? '#c3e6cb' : authStatus === 'failed' ? '#f5c6cb' : '#ffeaa7'}`
        }}>
          <h3 style={{ marginBottom: '8px', color: '#333' }}>Authentication Status</h3>
          <p style={{ margin: 0, color: authStatus === 'success' ? '#155724' : authStatus === 'failed' ? '#721c24' : '#856404' }}>
            {loading ? 'Testing authentication...' : 
             authStatus === 'success' ? '✅ Authentication successful' :
             authStatus === 'failed' ? '❌ Authentication failed' : '⏳ Pending'}
          </p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#333' }}>Order Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Order Number:</strong> {orderDetails.orderNumber}</div>
              <div><strong>Total Amount:</strong> Rs. {orderDetails.totalAmount}/-</div>
              <div><strong>Status:</strong> {orderDetails.status}</div>
              <div><strong>Created:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* eSewa Login Section */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '24px', 
          background: '#f8f9fa', 
          borderRadius: '12px',
          border: '2px solid #60BB46'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#60BB46', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span style={{ marginRight: '8px' }}>🔐</span>
              eSewa Login Required
            </div>
          </div>
          
          {/* Test Credentials Info */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '16px', 
            background: '#fff3cd', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ marginBottom: '12px', color: '#856404' }}>🔑 Test Credentials</h4>
            <p style={{ marginBottom: '12px', color: '#856404', fontSize: '14px' }}>
              Use these test credentials to simulate eSewa payment:
            </p>
            <div style={{ 
              background: '#fff', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #ffeaa7',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}>
              <div><strong>Email:</strong> test@esewa.com.np</div>
              <div><strong>Password:</strong> test123</div>
            </div>
          </div>

          {/* Payment Credentials Form */}
          {paymentStep === 'credentials' && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '20px', 
              background: '#fff', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '16px', color: '#333' }}>Enter eSewa Credentials</h4>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={testCredentials.email}
                  onChange={handleCredentialChange}
                  placeholder="Enter eSewa email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={testCredentials.password}
                  onChange={handleCredentialChange}
                  placeholder="Enter eSewa password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Payment Processing */}
          {paymentStep === 'processing' && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3', 
                borderTop: '4px solid #60BB46', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ margin: '0 0 8px 0', color: '#856404', fontWeight: '600' }}>
                Processing payment with eSewa...
              </p>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                Please wait while we verify your payment details
              </p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handleBackToBilling}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Back to Billing
            </button>
            
            {paymentStep === 'credentials' && (
            <button
              onClick={simulateEsewaPayment}
                disabled={loading || authStatus !== 'success'}
              style={{
                  background: '#60BB46',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                  opacity: loading ? 0.6 : 1
              }}
            >
                🔐 Proceed with eSewa Payment
            </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'processing' && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #60BB46', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ margin: 0, color: '#856404' }}>Processing payment with eSewa...</p>
          </div>
        )}

        {/* Instructions */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>📋 Test Instructions:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>This page simulates the eSewa payment process for testing purposes</li>
            <li>Use the provided test credentials: <strong>test@esewa.com.np</strong> / <strong>test123</strong></li>
            <li>In production, users would be redirected to the actual eSewa payment gateway</li>
            <li>After successful payment, your order will be confirmed and you'll be redirected to your profile</li>
            <li>You can view your complete order history in the "Order History" tab of your profile</li>
            <li>Order PDF invoices are available for download in your order history</li>
          </ul>
        </div>
      </main>
      
      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#60BB46',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: '#fff'
            }}>
              ✅
            </div>
            
            <h2 style={{ color: '#333', marginBottom: '16px' }}>Payment Successful!</h2>
            
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h4 style={{ marginBottom: '12px', color: '#333' }}>Payment Details:</h4>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div><strong>Order Number:</strong> {orderDetails?.orderNumber || 'N/A'}</div>
                <div><strong>Amount Paid:</strong> Rs. {orderDetails?.totalAmount || 'N/A'}/-</div>
                <div><strong>Payment Method:</strong> eSewa</div>
                <div><strong>Transaction ID:</strong> ES-{Date.now()}</div>
                <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Your order has been confirmed and will be processed shortly. 
              You will be redirected to your profile to view your order history.
            </p>
            
            <button
              onClick={closePaymentModal}
              style={{
                background: '#60BB46',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              View Order History
            </button>
          </div>
        </div>
      )}
      
      <Footer />
      
      {/* CSS for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TestEsewaPayment; 