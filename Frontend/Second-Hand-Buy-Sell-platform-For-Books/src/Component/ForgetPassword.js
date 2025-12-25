import React, { useState } from 'react';
import './ForgetPassword.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { toast } from 'react-toastify';
import { requestPasswordReset } from '../services/api';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('Verification link sent to your email/contact number!');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8fb' }}>
      <Navbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '40px 32px',
          maxWidth: 400,
          width: '100%',
          margin: '32px 0',
          border: '1px solid #e3e8ee',
        }}>
          <h2 style={{ textAlign: 'center', color: '#16A2F1', marginBottom: 16, fontWeight: 700 }}>Forget Password</h2>
          <p style={{ textAlign: 'center', color: '#222', marginBottom: 24 }}>
            Enter your email for verification process. We will send you a link to your email
          </p>
          <form onSubmit={handleSubmit} className="fp-form">
            <label className="fp-label" style={{ fontWeight: 600, marginBottom: 6 }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
              <span className="fp-icon" style={{ color: '#16A2F1', fontSize: 20, marginRight: 8 }}></span>
              <input
                type="text"
                className="fp-input"
                placeholder="Enter your Email account"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ borderBottom: '2px solid #16A2F1', color: '#222', borderRadius: 6, padding: '10px 12px', border: '1px solid #e3e8ee', background: '#f9fbfd', flex: 1 }}
              />
              <span className="fp-icon" style={{ color: '#16A2F1', fontSize: 20, marginLeft: 8 }}>@</span>
            </div>
            <button
              type="submit"
              className="fp-btn"
              style={{ background: '#16A2F1', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 16, padding: '12px 0', boxShadow: '0 2px 8px rgba(22,162,241,0.08)', transition: 'background 0.2s', width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Your Account'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgetPassword; 