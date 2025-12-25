import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { verifyPayment, getOrderById, downloadOrderPDF } from '../services/api';
import { useCart } from './CartContext';

const SuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);
        
        // Get payment ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('pid');
        
        if (paymentId) {
          // Verify payment with backend
          const paymentResult = await verifyPayment(paymentId);
          setPaymentStatus(paymentResult.status);
          
          // Get order details if payment is successful
          if (paymentResult.status === 'SUCCESS' && paymentResult.orderId) {
            const orderResult = await getOrderById(paymentResult.orderId);
            setOrderDetails(orderResult);
            
            // Clear cart after successful payment
            await clearCart();
          }
        }
      } catch (error) {
        console.error('Error handling payment success:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [clearCart]);

  const handleContinueShopping = () => {
    navigate('/search');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  const handleDownloadPDF = async () => {
    if (orderDetails && orderDetails.id) {
      try {
        await downloadOrderPDF(orderDetails.id);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download PDF: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="success-page">
        <Navbar />
        <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Verifying your payment...
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="success-page">
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
        {paymentStatus === 'SUCCESS' ? (
          <>
            {/* Success Icon */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px',
                color: '#fff'
              }}>
                ✓
              </div>
              <h2 style={{ color: '#28a745', marginBottom: '16px' }}>Payment Successful!</h2>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {/* Order Details */}
            {orderDetails && (
              <div style={{ 
                background: '#f8f9fa', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '32px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
                  Order Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <strong>Order Number:</strong> {orderDetails.orderNumber}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> Rs. {orderDetails.totalAmount}/-
                  </div>
                  <div>
                    <strong>Order Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: '#28a745', 
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}>
                      Confirmed
                    </span>
                  </div>
                </div>
                
                {orderDetails.deliveryAddress && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dee2e6' }}>
                    <strong>Delivery Address:</strong>
                    <div style={{ marginTop: '8px', color: '#666' }}>
                      {orderDetails.deliveryAddress}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div style={{ 
              background: '#e7f3ff', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '32px',
              border: '1px solid #b3d9ff'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#0056b3' }}>What's Next?</h3>
              <ul style={{ color: '#0056b3', lineHeight: '1.6' }}>
                <li>You will receive an email confirmation with order details</li>
                <li>We will process your order and prepare it for delivery</li>
                <li>Estimated delivery: 5-7 business days</li>
                <li>You can track your order status in your account</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={handleContinueShopping}
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Continue Shopping
              </button>
              <button
                onClick={handleViewOrders}
                style={{
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                View My Orders
              </button>
              {orderDetails && (
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  📄 Download Invoice
                </button>
              )}
            </div>
          </>
        ) : paymentStatus === 'error' ? (
          <>
            {/* Error Icon */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#dc3545',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '40px',
                color: '#fff'
              }}>
                ✕
              </div>
              <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Payment Verification Failed</h2>
              <p style={{ color: '#666', fontSize: '16px' }}>
                We couldn't verify your payment. Please contact our support team.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Back to Home
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Pending/Other Status */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#ffc107', marginBottom: '16px' }}>Payment Status: {paymentStatus}</h2>
              <p style={{ color: '#666', fontSize: '16px' }}>
                {state?.message || 'Your payment is being processed. Please wait...'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </main>
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

export default SuccessPage;