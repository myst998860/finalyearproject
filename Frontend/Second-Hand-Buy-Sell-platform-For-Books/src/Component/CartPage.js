import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from './CartContext';
import './HomePage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, loading, error, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [processingItem, setProcessingItem] = useState(null);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setProcessingItem(cartItemId);
      await updateQuantity(cartItemId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      setProcessingItem(cartItemId);
      await removeFromCart(cartItemId);
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/billing', { state: { cart, total: getCartTotal() } });
  };

  if (loading && cart.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading your cart...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <main style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32, color: '#333' }}>Your Cart</h2>
        
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            Error: {error}
          </div>
        )}
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Your cart is empty.
            </div>
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
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', background: '#f8f9fa' }}>
                    <th style={{ textAlign: 'left', padding: '16px 8px', fontWeight: '600' }}>Book</th>
                    <th style={{ textAlign: 'left', padding: '16px 8px', fontWeight: '600' }}>Author</th>
                    <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: '600' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '16px 8px', fontWeight: '600' }}>Price</th>
                    <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: '600' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={item.book.imageUrl || '/default-book.jpg'} 
                          alt={item.book.title} 
                          style={{ 
                            width: 60, 
                            height: 80, 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.book.title}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>{item.book.category}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#555' }}>{item.book.author}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={processingItem === item.id || item.quantity <= 1}
                            style={{
                              background: item.quantity <= 1 ? '#ccc' : '#007bff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              width: '32px',
                              height: '32px',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            minWidth: '40px', 
                            textAlign: 'center',
                            fontWeight: '600'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={processingItem === item.id}
                            style={{
                              background: '#007bff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              width: '32px',
                              height: '32px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: '600' }}>
                        Rs. {(item.book.price * item.quantity).toFixed(2)}/-
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={processingItem === item.id}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            cursor: processingItem === item.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            opacity: processingItem === item.id ? 0.6 : 1
                          }}
                        >
                          {processingItem === item.id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ 
              marginTop: '32px', 
              padding: '24px', 
              background: '#f8f9fa', 
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  Total ({cart.length} {cart.length === 1 ? 'item' : 'items'}):
                </span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  Rs. {getCartTotal().toFixed(2)}/-
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigate('/search')}
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
                  Continue Shopping
                </button>
                <button
                  onClick={handleCheckout}
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
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;