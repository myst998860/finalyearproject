import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { createOrder, initiateEsewaPayment, testAuthentication } from '../services/api';

const BillingPage = () => {
  const { cart, total } = useLocation().state || { cart: [], total: 0 };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryPhone: '',
    deliveryNotes: ''
  });
  const [errors, setErrors] = useState({});

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }
    if (!formData.deliveryPhone.trim()) {
      newErrors.deliveryPhone = 'Delivery phone is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.deliveryPhone)) {
      newErrors.deliveryPhone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if cart is empty
    if (!cart || cart.length === 0) {
      alert('Your cart is empty. Please add items to your cart before creating an order.');
      navigate('/search');
      return;
    }

    try {
      setLoading(true);
      
      // Create order in backend
      const orderResponse = await createOrder({
        deliveryAddress: formData.deliveryAddress,
        deliveryPhone: formData.deliveryPhone,
        deliveryNotes: formData.deliveryNotes
      });
      
      setOrder(orderResponse.order);
      setOrderCreated(true);
      
      // Automatically redirect to test payment for better UX
      setTimeout(() => {
        navigate('/test-payment', { 
          state: { 
            order: orderResponse.order, 
            cart: cart, 
            total: total 
          } 
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.message.includes('Cart is empty')) {
        alert('Your cart is empty. Please add items to your cart before creating an order.');
        navigate('/search');
      } else {
        alert('Failed to create order: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEsewaPayment = async () => {
    if (!order) {
      alert('Please create an order first');
      return;
    }

    try {
      setLoading(true);
      
      // Debug: Check if user is logged in
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('User not logged in. Please login again.');
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('User data:', user);
      console.log('Token exists:', !!user.token);
      
      // Test authentication first
      try {
        const authTest = await testAuthentication();
        console.log('Authentication test successful:', authTest);
      } catch (authError) {
        console.error('Authentication test failed:', authError);
        alert('Authentication failed. Please login again.');
        navigate('/login');
        return;
      }
      
      // Initiate eSewa payment
      const paymentResponse = await initiateEsewaPayment(order.id);
      
      // Get eSewa parameters
      const esewaParams = paymentResponse.esewaParams;
      
      // Create and submit eSewa form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://uat.esewa.com.np/epay/main'; // Use production URL for live: https://esewa.com.np/epay/main
      
      Object.entries(esewaParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (cart.length === 0) {
    return (
      <div className="billing-page">
        <Navbar />
        <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>No Items to Checkout</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>Your cart is empty. Please add some items before proceeding to checkout.</p>
            <button
              onClick={() => navigate('/search')}
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="billing-page">
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32, color: '#333' }}>Billing Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Order Summary */}
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              Order Summary
            </h3>
            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.book.title}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    Rs. {(item.book.price * item.quantity).toFixed(2)}/-
                  </div>
                </div>
              ))}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #dee2e6',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#007bff'
              }}>
                <span>Total:</span>
                <span>Rs. {total.toFixed(2)}/-</span>
              </div>
            </div>
          </div>

          {/* Billing Form */}
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              Delivery Information
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                Delivery Address *
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter your complete delivery address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.deliveryAddress ? '2px solid #dc3545' : '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              {errors.deliveryAddress && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {errors.deliveryAddress}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="deliveryPhone"
                value={formData.deliveryPhone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.deliveryPhone ? '2px solid #dc3545' : '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {errors.deliveryPhone && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {errors.deliveryPhone}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                Delivery Notes (Optional)
              </label>
              <textarea
                name="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={handleInputChange}
                placeholder="Any special instructions for delivery"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          marginTop: '32px', 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          padding: '24px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <button
            onClick={handleBackToCart}
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
            Back to Cart
          </button>
          
          {!orderCreated ? (
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              style={{
                background: '#28a745',
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
              {loading ? 'Creating Order...' : 'Create Order & Proceed to Payment'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={handleEsewaPayment}
                disabled={loading}
                style={{
                  background: '#007bff',
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
                {loading ? 'Processing...' : 'Pay with eSewa'}
              </button>
              
              {/* Test Payment Button for Development */}
              <button
                onClick={() => navigate('/test-payment', { 
                  state: { 
                    order: order, 
                    cart: cart, 
                    total: total 
                  } 
                })}
                style={{
                  background: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🧪 Test Payment (Development)
              </button>
            </div>
          )}
        </div>

        {orderCreated && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#d4edda', 
            color: '#155724',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            <strong>✅ Order Created Successfully!</strong><br/>
            <small>Order Number: {order?.orderNumber}</small><br/>
            <small>🔄 Redirecting to payment gateway...</small>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BillingPage;