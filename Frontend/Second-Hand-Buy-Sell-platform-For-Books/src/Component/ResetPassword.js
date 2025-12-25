import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ForgetPassword.css';
import Navbar from './Navbar';
import Footer from './Footer';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug logs
  console.log('Rendering ResetPassword');
  console.log('Token:', token);
  console.log('Password:', password);
  console.log('Confirm:', confirm);
  console.log('Loading:', loading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!token) {
      toast.error('Invalid or missing token.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8082/api/password/reset/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password.');
      }
      toast.success('Password reset successful! Please login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password.');
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
          <h2 style={{ textAlign: 'center', color: '#16A2F1', marginBottom: 16, fontWeight: 700 }}>Reset Password</h2>
          <form onSubmit={handleSubmit} className="fp-form">
            <label className="fp-label" style={{ fontWeight: 600, marginBottom: 6 }}>New Password</label>
            <input
              type="password"
              className="fp-input"
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ marginBottom: '18px', borderBottom: '2px solid #16A2F1', borderRadius: 6, padding: '10px 12px', border: '1px solid #e3e8ee', background: '#f9fbfd' }}
            />
            <label className="fp-label" style={{ fontWeight: 600, marginBottom: 6 }}>Confirm Password</label>
            <input
              type="password"
              className="fp-input"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{ marginBottom: '32px', borderBottom: '2px solid #16A2F1', borderRadius: 6, padding: '10px 12px', border: '1px solid #e3e8ee', background: '#f9fbfd' }}
            />
            <button
              type="submit"
              className="fp-btn"
              style={{ background: '#16A2F1', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 16, padding: '12px 0', boxShadow: '0 2px 8px rgba(22,162,241,0.08)', transition: 'background 0.2s', width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword; 